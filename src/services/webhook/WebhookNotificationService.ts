import { NotificationContact } from "../NotificationContact";
import { NotificationPayLoad } from "../NotificationPayLoad";
import { NotificationResponse } from "../NotificationResponse";
import { NotificationService } from "../NotificationService";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface WebhookConfig {
  defaultEndpoint?: string;
  headers?: Record<string, string>;
  timeout?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  maxRetries?: number;
  retryDelay?: number;
}

export class WebhookNotificationService extends NotificationService {
  private defaultEndpoint: string;
  private headers: Record<string, string>;
  private timeout: number;
  private method: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: WebhookConfig) {
    super();
    this.defaultEndpoint = config.defaultEndpoint || '';
    this.headers = config.headers || {
      'Content-Type': 'application/json'
    };
    this.timeout = config.timeout || 10000; // Default 10s timeout
    this.method = config.method || 'POST';
    this.maxRetries = config.maxRetries || 0;
    this.retryDelay = config.retryDelay || 1000;
  }

  private async executeWithRetry(
    fn: () => Promise<AxiosResponse>,
    retriesLeft: number, 
    delay: number
  ): Promise<AxiosResponse> {
    try {
      return await fn();
    } catch (error) {
      if (retriesLeft === 0) {
        throw error;
      }
      
      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry with exponential backoff
      return this.executeWithRetry(fn, retriesLeft - 1, delay * 2);
    }
  }

  async sendNotification(
    contact: NotificationContact,
    payload: NotificationPayLoad
  ): Promise<NotificationResponse> {
    try {
      const endpoint = contact.address || this.defaultEndpoint;
      
      if (!endpoint) {
        throw new Error('No webhook endpoint specified');
      }

      // Prepare request configuration
      const requestConfig: AxiosRequestConfig = {
        method: this.method,
        url: endpoint,
        headers: this.headers,
        timeout: this.timeout,
        data: this.method !== 'GET' ? payload : undefined,
        params: this.method === 'GET' ? payload : undefined
      };

      // Execute the HTTP request with retry capabilities
      const response = await this.executeWithRetry(
        () => axios(requestConfig),
        this.maxRetries,
        this.retryDelay
      );

      return {
        id: `webhook-${Date.now()}`,
        status: response.status >= 200 && response.status < 300,
        message: `Webhook notification sent successfully with status ${response.status}`,
        additional: {
          timestamp: new Date(),
          responseData: response.data,
          statusCode: response.status,
          headers: response.headers
        }
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      return {
        id: `webhook-error-${Date.now()}`,
        status: false,
        message: `Failed to send webhook: ${axiosError.message || String(error)}`,
        additional: {
          timestamp: new Date(),
          error: {
            code: axiosError.code,
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            headers: axiosError.response?.headers
          }
        }
      };
    }
  }
} 