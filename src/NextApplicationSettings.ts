import { NextOptions } from "./config/NextOptions";

export interface NextApplicationSettings {
  nextOptions?: NextOptions;
  plugins?: Record<string, any>;
  workflow?: {
    dynamicLoading?: {
      enabled: boolean;
      dbPlugin?: string;
      enableMetrics?: boolean;
      loadVersionHistory?: boolean;
      versionHistory?: boolean;
      tables?: {
        routers?: string;
        routes?: string;
        actions?: string;
        metrics?: string;
        versions?: string;
      };
    };
  };
  dynamicConfig?: {
    enabled: boolean;
    dbPlugin?: string;
    tables?: {
      settings?: string;
      authProviders?: string;
      permissions?: string;
      roles?: string;
    };
  };
} 