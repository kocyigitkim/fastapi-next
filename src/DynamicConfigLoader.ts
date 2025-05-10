import { NextApplicationSettings } from "./NextApplicationSettings";

interface DbAppSettings {
  id: string;
  key: string;
  value: any;
  group: string;
  description?: string;
  enabled: boolean;
}

interface DbAuthProvider {
  id: string;
  name: string;
  type: string;
  config: any;
  enabled: boolean;
}

interface DbAuthPermission {
  id: string;
  name: string;
  path: string;
  description?: string;
  roles?: string | string[];
  enabled: boolean;
}

interface DbRole {
  id: string;
  name: string;
  description?: string;
  permissions: string | string[];
  enabled: boolean;
}

interface DynamicConfiguration {
  settings: Record<string, any>;
  authProviders: any[];
  permissions: any[];
  roles: any[];
}

export class DynamicConfigLoader {
  private dbPlugin: any;
  private initialized: boolean = false;
  private config: DynamicConfiguration = {
    settings: {},
    authProviders: [],
    permissions: [],
    roles: []
  };
  
  constructor(private settings: NextApplicationSettings) {}
  
  public async initialize(): Promise<boolean> {
    if (!this.settings.dynamicConfig?.enabled) {
      return false;
    }
    
    const dbPluginName = this.settings.dynamicConfig.dbPlugin || 'db';
    this.dbPlugin = this.settings.plugins?.[dbPluginName];
    
    if (!this.dbPlugin) {
      console.error(`Dynamic configuration loading enabled but database plugin '${dbPluginName}' not found.`);
      return false;
    }
    
    try {
      await this.loadAppSettings();
      await this.loadAuthProviders();
      await this.loadPermissions();
      await this.loadRoles();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize dynamic config loader:', error);
      return false;
    }
  }
  
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  public getConfiguration(): DynamicConfiguration {
    return this.config;
  }
  
  public getSettings(): Record<string, any> {
    return this.config.settings;
  }
  
  public getAuthProviders(): any[] {
    return this.config.authProviders;
  }
  
  public getPermissions(): any[] {
    return this.config.permissions;
  }
  
  public getRoles(): any[] {
    return this.config.roles;
  }
  
  private async loadAppSettings(): Promise<void> {
    try {
      const settingsTable = this.settings.dynamicConfig?.tables?.settings || 'app_settings';
      const settingsQuery = `SELECT * FROM ${settingsTable} WHERE enabled = 1`;
      
      const dbSettings: DbAppSettings[] = await this.dbPlugin.query(settingsQuery);
      
      // Group settings by their group
      const groupedSettings: Record<string, Record<string, any>> = {};
      
      for (const setting of dbSettings) {
        if (!groupedSettings[setting.group]) {
          groupedSettings[setting.group] = {};
        }
        
        // Parse JSON values
        let value = setting.value;
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        
        groupedSettings[setting.group][setting.key] = value;
      }
      
      this.config.settings = groupedSettings;
    } catch (error) {
      console.error('Error loading app settings:', error);
      throw error;
    }
  }
  
  private async loadAuthProviders(): Promise<void> {
    try {
      const providersTable = this.settings.dynamicConfig?.tables?.authProviders || 'auth_providers';
      const providersQuery = `SELECT * FROM ${providersTable} WHERE enabled = 1`;
      
      const dbProviders: DbAuthProvider[] = await this.dbPlugin.query(providersQuery);
      
      this.config.authProviders = dbProviders.map(provider => {
        // Parse config if it's stored as a string
        let config = provider.config;
        if (typeof config === 'string') {
          try {
            config = JSON.parse(config);
          } catch (e) {
            console.warn(`Failed to parse config for auth provider ${provider.name}:`, e);
          }
        }
        
        return {
          id: provider.id,
          name: provider.name,
          type: provider.type,
          config
        };
      });
    } catch (error) {
      console.error('Error loading auth providers:', error);
      throw error;
    }
  }
  
  private async loadPermissions(): Promise<void> {
    try {
      const permissionsTable = this.settings.dynamicConfig?.tables?.permissions || 'auth_permissions';
      const permissionsQuery = `SELECT * FROM ${permissionsTable} WHERE enabled = 1`;
      
      const dbPermissions: DbAuthPermission[] = await this.dbPlugin.query(permissionsQuery);
      
      this.config.permissions = dbPermissions.map(permission => {
        // Parse roles if stored as a string
        let roles: string[] = [];
        if (typeof permission.roles === 'string') {
          try {
            roles = JSON.parse(permission.roles);
          } catch (e) {
            roles = permission.roles.split(',').map(r => r.trim());
          }
        } else if (Array.isArray(permission.roles)) {
          roles = permission.roles;
        }
        
        return {
          id: permission.id,
          name: permission.name,
          path: permission.path,
          description: permission.description,
          roles
        };
      });
    } catch (error) {
      console.error('Error loading permissions:', error);
      throw error;
    }
  }
  
  private async loadRoles(): Promise<void> {
    try {
      const rolesTable = this.settings.dynamicConfig?.tables?.roles || 'auth_roles';
      const rolesQuery = `SELECT * FROM ${rolesTable} WHERE enabled = 1`;
      
      const dbRoles: DbRole[] = await this.dbPlugin.query(rolesQuery);
      
      this.config.roles = dbRoles.map(role => {
        // Parse permissions if stored as a string
        let permissions: string[] = [];
        if (typeof role.permissions === 'string') {
          try {
            permissions = JSON.parse(role.permissions);
          } catch (e) {
            permissions = role.permissions.split(',').map(p => p.trim());
          }
        } else if (Array.isArray(role.permissions)) {
          permissions = role.permissions;
        }
        
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions
        };
      });
    } catch (error) {
      console.error('Error loading roles:', error);
      throw error;
    }
  }
  
  // Method to merge dynamic config with static config
  public mergeWithStatic(staticConfig: any): any {
    if (!this.initialized) return staticConfig;
    
    // Deep merge the configurations
    const mergedConfig = { ...staticConfig };
    
    // Merge settings groups
    for (const [groupKey, groupValue] of Object.entries(this.config.settings)) {
      if (!mergedConfig[groupKey]) {
        mergedConfig[groupKey] = {};
      }
      
      mergedConfig[groupKey] = {
        ...mergedConfig[groupKey],
        ...groupValue
      };
    }
    
    // Merge auth configuration if it exists
    if (this.config.authProviders.length > 0 && !mergedConfig.auth) {
      mergedConfig.auth = {};
    }
    
    if (mergedConfig.auth) {
      if (this.config.authProviders.length > 0) {
        mergedConfig.auth.providers = [
          ...(mergedConfig.auth.providers || []),
          ...this.config.authProviders
        ];
      }
      
      if (this.config.permissions.length > 0) {
        mergedConfig.auth.permissions = [
          ...(mergedConfig.auth.permissions || []),
          ...this.config.permissions
        ];
      }
      
      if (this.config.roles.length > 0) {
        mergedConfig.auth.roles = [
          ...(mergedConfig.auth.roles || []),
          ...this.config.roles
        ];
      }
    }
    
    return mergedConfig;
  }
} 