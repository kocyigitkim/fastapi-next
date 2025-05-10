import { MailNotificationService } from "../MailNotificationService";
import { NotificationContact } from "../NotificationContact";
import { NotificationPayLoad } from "../NotificationPayLoad";
import { NotificationResponse } from "../NotificationResponse";
import * as sgMail from '@sendgrid/mail';

export interface SendGridConfig {
  apiKey: string;
  defaultFrom?: string;
  sandboxMode?: boolean;
}

export class SendGridMailService extends MailNotificationService {
  private apiKey: string;
  private defaultFrom: string;
  private sandboxMode: boolean;

  constructor(config: SendGridConfig) {
    super();
    this.apiKey = config.apiKey;
    this.defaultFrom = config.defaultFrom || 'noreply@example.com';
    this.sandboxMode = config.sandboxMode || false;
    
    // Initialize SendGrid API
    sgMail.setApiKey(this.apiKey);
  }

  async sendNotification(
    contact: NotificationContact,
    payload: NotificationPayLoad
  ): Promise<NotificationResponse> {
    try {
      // Build recipient list
      const to = contact.address;
      
      if (!to) {
        throw new Error('No recipient email address provided');
      }

      // Prepare email message
      const msg = {
        to,
        from: this.defaultFrom,
        subject: payload.subject || 'Notification',
        text: payload.plaintext || payload.message,
        html: payload.html ? payload.message : undefined,
        mailSettings: {
          sandboxMode: {
            enable: this.sandboxMode
          }
        }
      };

      // Add attachments if present
      if (payload.additional?.attachments?.length) {
        msg['attachments'] = payload.additional.attachments.map(attachment => ({
          filename: attachment.name,
          content: attachment.content,
          type: attachment.contentType || 'application/octet-stream',
          disposition: 'attachment'
        }));
      }

      // Send email through SendGrid
      const response = await sgMail.send(msg);
      
      return {
        id: response[0]?.headers['x-message-id'] || `sendgrid-${Date.now()}`,
        status: true,
        message: 'Email sent successfully via SendGrid',
        additional: {
          timestamp: new Date(),
          response: {
            statusCode: response[0]?.statusCode,
            headers: response[0]?.headers
          }
        }
      };
    } catch (error) {
      // Handle SendGrid specific errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorDetails = {};
      
      if (error.response && error.response.body) {
        errorMessage = `SendGrid API Error: ${errorMessage}`;
        errorDetails = {
          statusCode: error.code || error.response.statusCode,
          errors: error.response.body.errors
        };
      }
      
      return {
        id: `sendgrid-error-${Date.now()}`,
        status: false,
        message: errorMessage,
        additional: {
          timestamp: new Date(),
          error: errorDetails
        }
      };
    }
  }
} 