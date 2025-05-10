import { NextApplication } from "./NextApplication";
import { NextApplicationSettings } from "./NextApplicationSettings";
import { DynamicConfigLoader } from "./DynamicConfigLoader";
import { initializeWorkflows, WorkflowRouter } from "./workflows";

/**
 * Integration helper to add dynamic configuration capabilities to a NextApplication instance
 */
export class DynamicConfigIntegration {
  private dynamicConfigLoader: DynamicConfigLoader;
  private configLoaded: boolean = false;
  
  constructor(
    private app: NextApplication,
    private settings: NextApplicationSettings
  ) {
    this.dynamicConfigLoader = new DynamicConfigLoader(settings);
  }
  
  /**
   * Initialize dynamic configuration and integrate it with the application
   */
  public async initialize(): Promise<boolean> {
    if (!this.settings.dynamicConfig?.enabled) {
      console.log('Dynamic configuration is disabled, skipping initialization');
      return false;
    }
    
    try {
      // Initialize the dynamic config loader
      const initialized = await this.dynamicConfigLoader.initialize();
      
      if (!initialized) {
        console.warn('Dynamic configuration loading failed, using static configuration only');
        return false;
      }
      
      console.log('Dynamic configuration loaded successfully');
      this.configLoaded = true;
      
      // Apply the dynamic configuration to the application
      await this.applyConfiguration();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize dynamic configuration:', error);
      return false;
    }
  }
  
  /**
   * Apply the loaded dynamic configuration to the application
   */
  private async applyConfiguration(): Promise<void> {
    if (!this.configLoaded) return;
    
    // Apply authentication configuration
    await this.applyAuthConfiguration();
    
    // Initialize workflow routers from dynamic configuration
    await this.initializeWorkflows();
  }
  
  /**
   * Apply authentication configuration from dynamic config
   */
  private async applyAuthConfiguration(): Promise<void> {
    const authProviders = this.dynamicConfigLoader.getAuthProviders();
    const permissions = this.dynamicConfigLoader.getPermissions();
    const roles = this.dynamicConfigLoader.getRoles();
    
    console.log(`Applying dynamic auth configuration: ${authProviders.length} providers, ${permissions.length} permissions, ${roles.length} roles`);
    
    // Here you would typically:
    // 1. Add the dynamic auth providers to the application
    // 2. Set up the permissions system with the dynamic permissions
    // 3. Configure role-based access control with the dynamic roles
    
    // This is an example integration and would need to be customized based on
    // how your authentication system is implemented
    
    // Check if the application has an auth system (implementation depends on your app structure)
    if ((this.app as any).auth) {
      // Set up authentication providers
      for (const provider of authProviders) {
        console.log(`Setting up ${provider.name} authentication provider`);
        
        // Example of integrating with the auth system
        // (this.app as any).auth.addProvider(provider.name, provider.config);
      }
      
      // Set up permissions
      for (const permission of permissions) {
        console.log(`Setting up permission: ${permission.name} for path ${permission.path}`);
        
        // Example of integrating with the permissions system
        // (this.app as any).auth.addPermission(permission.name, permission.path, permission.roles);
      }
      
      // Set up roles
      for (const role of roles) {
        console.log(`Setting up role: ${role.name} with ${role.permissions.length} permissions`);
        
        // Example of integrating with the roles system
        // (this.app as any).auth.addRole(role.name, role.permissions);
      }
    }
  }
  
  /**
   * Initialize workflow routers from dynamic configuration
   */
  private async initializeWorkflows(): Promise<void> {
    // Initialize workflow routers (both static and dynamic)
    const staticWorkflowRouters: WorkflowRouter[] = [];
    
    // You may have existing static routers to include
    // staticWorkflowRouters.push(...existingRouters);
    
    const workflowRouters = await initializeWorkflows(this.settings, staticWorkflowRouters);
    
    console.log(`Initialized ${workflowRouters.length} workflow routers (including dynamic ones)`);
    
    // Mount routers to the application
    for (const router of workflowRouters) {
      console.log(`Mounting router at path: ${router.getPath()}`);
      router.mount(this.app);
    }
  }
  
  /**
   * Access the application settings with dynamic configuration merged in
   */
  public getMergedConfig(): any {
    if (!this.configLoaded) {
      return this.settings;
    }
    
    return this.dynamicConfigLoader.mergeWithStatic(this.settings);
  }
  
  /**
   * Get a specific configuration value, with dynamic values taking precedence
   */
  public getConfigValue(path: string): any {
    const config = this.getMergedConfig();
    
    const parts = path.split('.');
    let current = config;
    
    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }
}

/**
 * Example usage of DynamicConfigIntegration
 */
export async function setupDynamicConfig(app: NextApplication, settings: NextApplicationSettings): Promise<DynamicConfigIntegration> {
  const integration = new DynamicConfigIntegration(app, settings);
  await integration.initialize();
  return integration;
} 