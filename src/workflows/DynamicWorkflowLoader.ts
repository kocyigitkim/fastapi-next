import { WorkflowRouter } from "./WorkflowRouter";
import { WorkflowRoute } from "./WorkflowRoute";
import { WorkflowRouteAction } from "./WorkflowRouteAction";
import { CurrentArgsSource } from "./WorkflowExecuteContext";
import { IfCondition } from "./actions/IfAction";
import { ObjectSchema, Schema, AnyObjectSchema, ArraySchema, AnyObject } from "yup";
import { WorkflowRouteActionResult } from "./WorkflowRouteActionResult";
import { NextApplicationSettings } from "../NextApplicationSettings";
import { StoredProcedureAction } from "./actions/StoredProcedureAction";
import { MapAction } from "./actions/MapAction";
import { CreateAction } from "./actions/CreateAction";
import { UpdateAction } from "./actions/UpdateAction";
import { DeleteAction } from "./actions/DeleteAction";
import { RetrieveOneAction } from "./actions/RetrieveOneAction";
import { RetrieveManyAction } from "./actions/RetrieveManyAction";
import { IfAction } from "./actions/IfAction";
import { ValidateAction } from "./actions/ValidateAction";
import { LogAction } from "./actions/LogAction";
import { RetryAction } from "./actions/RetryAction";
import { TransformAction } from "./actions/TransformAction";
import { ParallelAction, ActionBuilder } from "./actions/ParallelAction";
import { SwitchAction } from "./actions/SwitchAction";
import { CacheAction, CacheMode } from "./actions/CacheAction";
import { LimiterAction } from "./actions/LimiterAction";
import * as yup from 'yup';

interface DbWorkflowRouter {
  id: string;
  name: string;
  path: string;
  enabled: boolean;
  description?: string;
  version?: string;
}

interface DbWorkflowRoute {
  id: string;
  routerId: string;
  path: string;
  methods: string[];
  summary?: string;
  description?: string;
  tags?: string;
  isDeprecated: boolean;
  enabled: boolean;
  version?: string;
}

interface DbWorkflowAction {
  id: string;
  routeId: string;
  type: string;
  order: number;
  config: any;
  enabled: boolean;
}

interface WorkflowVersionInfo {
  id: string;
  routerId?: string;
  routeId?: string;
  actionId?: string;
  version: string;
  entity_type: 'router' | 'route' | 'action';
  config: any;
  created_at: Date;
}

export class DynamicWorkflowLoader {
  public dbPlugin: any;
  private initialized: boolean = false;
  private routers: Map<string, WorkflowRouter> = new Map();
  private routes: Map<string, WorkflowRoute> = new Map();
  private versionInfo: Map<string, WorkflowVersionInfo[]> = new Map();
  private metricsEnabled: boolean = false;
  
  constructor(private settings: NextApplicationSettings) {
    this.metricsEnabled = settings.workflow?.dynamicLoading?.enableMetrics || false;
  }
  
  public async initialize(): Promise<boolean> {
    if (!this.settings.workflow?.dynamicLoading?.enabled) {
      return false;
    }
    
    const dbPluginName = this.settings.workflow.dynamicLoading.dbPlugin || 'db';
    this.dbPlugin = this.settings.plugins?.[dbPluginName];
    
    if (!this.dbPlugin) {
      console.error(`Dynamic workflow loading enabled but database plugin '${dbPluginName}' not found.`);
      return false;
    }
    
    try {
      await this.loadRouters();
      await this.loadRoutes();
      await this.loadActions();
      if (this.settings.workflow.dynamicLoading.loadVersionHistory) {
        await this.loadVersionHistory();
      }
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize dynamic workflow loader:', error);
      return false;
    }
  }
  
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  public getRouters(): WorkflowRouter[] {
    return Array.from(this.routers.values());
  }
  
  private async loadRouters(): Promise<void> {
    const routersTable = this.settings.workflow.dynamicLoading.tables?.routers || 'workflow_routers';
    const routersQuery = `SELECT * FROM ${routersTable} WHERE enabled = 1 ORDER BY name`;
    
    const dbRouters: DbWorkflowRouter[] = await this.dbPlugin.query(routersQuery);
    
    for (const dbRouter of dbRouters) {
      const router = new WorkflowRouter(dbRouter.path);
      router.name = dbRouter.name;
      if (dbRouter.description) {
        router.description = dbRouter.description;
      }
      
      this.routers.set(dbRouter.id, router);
    }
  }
  
  private async loadRoutes(): Promise<void> {
    const routesTable = this.settings.workflow.dynamicLoading.tables?.routes || 'workflow_routes';
    const routesQuery = `SELECT * FROM ${routesTable} WHERE enabled = 1 ORDER BY routerId, path`;
    
    const dbRoutes: DbWorkflowRoute[] = await this.dbPlugin.query(routesQuery);
    
    for (const dbRoute of dbRoutes) {
      const router = this.routers.get(dbRoute.routerId);
      if (!router) {
        console.warn(`Route ${dbRoute.id} references non-existent router ${dbRoute.routerId}`);
        continue;
      }
      
      const route = new WorkflowRoute(router, dbRoute.path);
      route.id = dbRoute.id; // Set the database ID for metrics tracking
      
      // Set route properties
      if (dbRoute.summary) route.sum(dbRoute.summary);
      if (dbRoute.description) route.desc(dbRoute.description);
      if (dbRoute.tags) route.tag(dbRoute.tags);
      if (dbRoute.isDeprecated) route.deprecated();
      
      // Set HTTP methods
      const methods = typeof dbRoute.methods === 'string' 
        ? JSON.parse(dbRoute.methods) 
        : dbRoute.methods;
        
      for (const method of methods) {
        route.method(method);
      }
      
      // Enable metrics tracking if configured
      if (this.metricsEnabled) {
        route.enableMetrics(this.dbPlugin, this.settings.workflow.dynamicLoading.tables?.metrics || 'workflow_metrics');
      }
      
      this.routes.set(dbRoute.id, route);
      router.add(route);
    }
  }
  
  private async loadActions(): Promise<void> {
    const actionsTable = this.settings.workflow.dynamicLoading.tables?.actions || 'workflow_actions';
    const actionsQuery = `SELECT * FROM ${actionsTable} WHERE enabled = 1 ORDER BY routeId, order`;
    
    const dbActions: DbWorkflowAction[] = await this.dbPlugin.query(actionsQuery);
    
    for (const dbAction of dbActions) {
      const route = this.routes.get(dbAction.routeId);
      if (!route) {
        console.warn(`Action ${dbAction.id} references non-existent route ${dbAction.routeId}`);
        continue;
      }
      
      try {
        const action = this.createAction(dbAction.type, dbAction.config);
        if (action) {
          route.action(action);
        }
      } catch (error) {
        console.error(`Failed to create action ${dbAction.id} of type ${dbAction.type}:`, error);
      }
    }
  }
  
  private createAction(type: string, config: any): WorkflowRouteAction | null {
    switch (type.toLowerCase()) {
      case 'storedprocedure':
        return new StoredProcedureAction(
          config.db || 'db',
          config.name,
          config.args,
          config.firstArg
        );
      
      case 'map':
        return new MapAction(
          this.parseEnumValue(CurrentArgsSource, config.source),
          config.map
        );
      
      case 'create':
        return new CreateAction(
          config.db || 'db',
          config.table,
          config.args,
          config.returns
        );
      
      case 'update':
        return new UpdateAction(
          config.db || 'db',
          config.table,
          config.args,
          config.where,
          config.returns
        );
      
      case 'delete':
        return new DeleteAction(
          config.db || 'db',
          config.table,
          config.where,
          config.returns,
          config.field,
          config.deletedValue
        );
      
      case 'retrieveone':
        return new RetrieveOneAction(
          config.db || 'db',
          config.table,
          config.where,
          config.projection
        );
      
      case 'retrievemany':
        return new RetrieveManyAction(
          config.db || 'db',
          config.table,
          config.projection,
          config.searchColumns,
          config.searchField,
          config.filterField,
          config.sortByField,
          config.sortDirField,
          config.pageIndexField,
          config.pageSizeField,
          config.where
        );
      
      case 'if':
        // For IF actions, we need to parse the condition and actions from JSON
        return this.createIfAction(config);
      
      case 'validate':
        // For validation, we need to parse schema from JSON
        return this.createValidateAction(config);
      
      case 'log':
        return new LogAction(
          config.message,
          config.logLevel,
          config.includeContext,
          config.contextPath
        );
      
      case 'retry':
        // For retry, we need to parse the action builder
        return this.createRetryAction(config);
      
      case 'transform':
        // For transform, we need to parse transform functions
        return this.createTransformAction(config);
      
      case 'parallel':
        // For parallel, we need to parse action builders
        return this.createParallelAction(config);
      
      case 'switch':
        // For switch, we need to parse case handlers
        return this.createSwitchAction(config);
      
      case 'cache':
        return new CacheAction(
          config.key,
          this.parseEnumValue(CacheMode, config.mode) || CacheMode.GET,
          {
            ttlMs: config.ttlMs,
            actionBuilder: config.action ? this.parseActionBuilder(config.action) : undefined,
            fallbackValue: config.fallbackValue
          }
        );
      
      case 'limiter':
        return new LimiterAction(
          config.key,
          {
            limit: config.limit,
            windowMs: config.windowMs,
            actionBuilder: config.action ? this.parseActionBuilder(config.action) : undefined,
            errorMessage: config.errorMessage,
            errorStatus: config.errorStatus
          }
        );
      
      default:
        console.warn(`Unknown action type: ${type}`);
        return null;
    }
  }
  
  private parseEnumValue<T>(enumObj: any, value?: string): T | undefined {
    if (!value) return undefined;
    return enumObj[value] as T;
  }
  
  private createIfAction(config: any): IfAction {
    // For dynamic loading, condition would need to be a string that gets evaluated
    // This is a simplified version that uses a function evaluator
    const conditionFn = this.createDynamicFunction(config.condition);
    
    const trueActionBuilder = config.trueAction 
      ? this.parseActionBuilder(config.trueAction)
      : undefined;
      
    const falseActionBuilder = config.falseAction
      ? this.parseActionBuilder(config.falseAction)
      : undefined;
    
    // Cast the function to IfCondition type
    return new IfAction(conditionFn as unknown as IfCondition, trueActionBuilder, falseActionBuilder);
  }
  
  private createValidateAction(config: any): ValidateAction {
    // Convert JSON schema definition to yup schema
    const schema = this.buildYupSchema(config.schema);
    // Cast schema to ObjectSchema type
    return new ValidateAction(schema as ObjectSchema<any>);
  }
  
  private createRetryAction(config: any): RetryAction {
    const actionBuilder = this.parseActionBuilder(config.action);
    
    const retryConditionFn = config.retryCondition
      ? this.createDynamicFunction(config.retryCondition)
      : undefined;
    
    // Cast to correct function type
    const typedCondition = retryConditionFn 
      ? ((result: WorkflowRouteActionResult) => !!retryConditionFn(result)) as (result: WorkflowRouteActionResult) => boolean
      : undefined;
    
    return new RetryAction(
      actionBuilder,
      config.maxAttempts,
      config.delayMs,
      typedCondition
    );
  }
  
  private createTransformAction(config: any): TransformAction {
    // For dynamic loading, transform functions would need to be strings that get evaluated
    const source = this.parseEnumValue(CurrentArgsSource, config.source) || CurrentArgsSource.all;
    
    let transformFn;
    if (Array.isArray(config.transformFn)) {
      transformFn = config.transformFn.map((fn: string) => this.createDynamicFunction(fn));
    } else {
      transformFn = this.createDynamicFunction(config.transformFn);
    }
    
    // Cast source to ensure it's of CurrentArgsSource type
    return new TransformAction(source as CurrentArgsSource, transformFn, config.sourceKey);
  }
  
  private createParallelAction(config: any): ParallelAction {
    const actionBuilders = config.actions.map((actionConfig: any) => 
      this.parseActionBuilder(actionConfig)
    );
    
    return new ParallelAction(
      actionBuilders,
      {
        failFast: config.failFast,
        maxConcurrent: config.maxConcurrent
      }
    );
  }
  
  private createSwitchAction(config: any): SwitchAction {
    let expression;
    if (typeof config.expression === 'string' && config.expression.startsWith('function')) {
      expression = this.createDynamicFunction(config.expression);
    } else {
      expression = config.expression;
    }
    
    const source = this.parseEnumValue(CurrentArgsSource, config.source);
    // Cast source to ensure it's of CurrentArgsSource type
    const switchAction = new SwitchAction(expression, source as CurrentArgsSource);
    
    // Add cases
    if (config.cases && Array.isArray(config.cases)) {
      for (const caseConfig of config.cases) {
        const handler = this.parseActionBuilder(caseConfig.handler);
        switchAction.case(caseConfig.value, handler);
      }
    }
    
    // Add default case
    if (config.defaultCase) {
      const defaultHandler = this.parseActionBuilder(config.defaultCase);
      switchAction.default(defaultHandler);
    }
    
    return switchAction;
  }
  
  private parseActionBuilder(actionConfig: any): (route: WorkflowRoute) => WorkflowRoute {
    return (route: WorkflowRoute) => {
      // Create a temporary route
      const tempRoute = new WorkflowRoute(null, "");
      
      // Process each action in the config
      if (Array.isArray(actionConfig.actions)) {
        for (const actionDef of actionConfig.actions) {
          const action = this.createAction(actionDef.type, actionDef.config);
          if (action) {
            tempRoute.action(action);
          }
        }
      }
      
      return tempRoute;
    };
  }
  
  private createDynamicFunction(fnString: string): Function {
    if (!fnString) return () => true;
    
    // SAFETY WARNING: This is using eval() which can be dangerous if the input is not trusted
    // In a production system, you would want to use a safer method or a sandbox
    try {
      // For simple expressions
      if (!fnString.startsWith('function')) {
        return new Function('ctx', `return ${fnString}`);
      }
      
      // For full functions
      const fnBody = fnString.substring(fnString.indexOf('{') + 1, fnString.lastIndexOf('}'));
      return new Function('ctx', fnBody);
    } catch (error) {
      console.error('Failed to create dynamic function:', error);
      return () => false;
    }
  }
  
  private buildYupSchema(schemaConfig: any): yup.Schema<any> {
    // Convert a JSON schema definition to a yup schema
    // This is a simplified version that handles basic types
    
    if (!schemaConfig || !schemaConfig.type) {
      return yup.mixed();
    }
    
    switch (schemaConfig.type) {
      case 'object':
        let objSchema = yup.object();
        
        if (schemaConfig.properties) {
          const shape: Record<string, yup.Schema<any>> = {};
          
          for (const [key, propConfig] of Object.entries(schemaConfig.properties)) {
            shape[key] = this.buildYupSchema(propConfig as any);
          }
          
          objSchema = objSchema.shape(shape);
        }
        
        if (schemaConfig.required && Array.isArray(schemaConfig.required)) {
          for (const field of schemaConfig.required) {
            // Call required with field directly instead of in array
            objSchema = objSchema.required(field);
          }
        }
        
        return objSchema;
        
      case 'array':
        let arrSchema = yup.array();
        
        if (schemaConfig.items) {
          const innerSchema = this.buildYupSchema(schemaConfig.items);
          // Use type assertion to fix type compatibility
          arrSchema = arrSchema.of(innerSchema) as any;
        }
        
        if (schemaConfig.min !== undefined) {
          arrSchema = arrSchema.min(schemaConfig.min);
        }
        
        if (schemaConfig.max !== undefined) {
          arrSchema = arrSchema.max(schemaConfig.max);
        }
        
        return arrSchema;
        
      case 'string':
        let strSchema = yup.string();
        
        if (schemaConfig.min !== undefined) {
          strSchema = strSchema.min(schemaConfig.min);
        }
        
        if (schemaConfig.max !== undefined) {
          strSchema = strSchema.max(schemaConfig.max);
        }
        
        if (schemaConfig.matches) {
          strSchema = strSchema.matches(new RegExp(schemaConfig.matches));
        }
        
        return strSchema;
        
      case 'number':
        let numSchema = yup.number();
        
        if (schemaConfig.min !== undefined) {
          numSchema = numSchema.min(schemaConfig.min);
        }
        
        if (schemaConfig.max !== undefined) {
          numSchema = numSchema.max(schemaConfig.max);
        }
        
        return numSchema;
        
      case 'boolean':
        return yup.boolean();
        
      default:
        return yup.mixed();
    }
  }
  
  // New methods for version management and administrative functions
  
  public async saveWorkflowRouter(router: DbWorkflowRouter): Promise<string> {
    const routersTable = this.settings.workflow.dynamicLoading.tables?.routers || 'workflow_routers';
    const isNew = !router.id;
    
    if (isNew) {
      router.id = this.generateUuid();
      
      const insertQuery = `INSERT INTO ${routersTable} 
        (id, name, path, description, enabled) 
        VALUES (?, ?, ?, ?, ?)`;
      
      await this.dbPlugin.execute(insertQuery, [
        router.id, 
        router.name, 
        router.path, 
        router.description || null, 
        router.enabled ? 1 : 0
      ]);
    } else {
      // Save previous version to history if versioning is enabled
      if (this.settings.workflow.dynamicLoading.versionHistory) {
        await this.saveEntityVersion('router', router.id);
      }
      
      const updateQuery = `UPDATE ${routersTable} 
        SET name = ?, path = ?, description = ?, enabled = ?
        WHERE id = ?`;
      
      await this.dbPlugin.execute(updateQuery, [
        router.name, 
        router.path, 
        router.description || null, 
        router.enabled ? 1 : 0,
        router.id
      ]);
    }
    
    // Refresh in-memory router if already loaded
    if (this.initialized) {
      await this.refreshRouter(router.id);
    }
    
    return router.id;
  }
  
  public async saveWorkflowRoute(route: DbWorkflowRoute): Promise<string> {
    const routesTable = this.settings.workflow.dynamicLoading.tables?.routes || 'workflow_routes';
    const isNew = !route.id;
    
    // Ensure methods are stored as JSON string
    const methods = typeof route.methods === 'string' 
      ? route.methods 
      : JSON.stringify(route.methods);
    
    if (isNew) {
      route.id = this.generateUuid();
      
      const insertQuery = `INSERT INTO ${routesTable} 
        (id, router_id, path, methods, summary, description, tags, is_deprecated, enabled) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      await this.dbPlugin.execute(insertQuery, [
        route.id, 
        route.routerId, 
        route.path, 
        methods, 
        route.summary || null, 
        route.description || null, 
        route.tags || null, 
        route.isDeprecated ? 1 : 0, 
        route.enabled ? 1 : 0
      ]);
    } else {
      // Save previous version to history if versioning is enabled
      if (this.settings.workflow.dynamicLoading.versionHistory) {
        await this.saveEntityVersion('route', route.id);
      }
      
      const updateQuery = `UPDATE ${routesTable} 
        SET router_id = ?, path = ?, methods = ?, summary = ?, description = ?, 
            tags = ?, is_deprecated = ?, enabled = ?
        WHERE id = ?`;
      
      await this.dbPlugin.execute(updateQuery, [
        route.routerId, 
        route.path, 
        methods, 
        route.summary || null, 
        route.description || null, 
        route.tags || null, 
        route.isDeprecated ? 1 : 0, 
        route.enabled ? 1 : 0,
        route.id
      ]);
    }
    
    // Refresh in-memory route if already loaded
    if (this.initialized) {
      await this.refreshRoute(route.id);
    }
    
    return route.id;
  }
  
  public async saveWorkflowAction(action: DbWorkflowAction): Promise<string> {
    const actionsTable = this.settings.workflow.dynamicLoading.tables?.actions || 'workflow_actions';
    const isNew = !action.id;
    
    // Ensure config is stored as JSON string
    const config = typeof action.config === 'string' 
      ? action.config 
      : JSON.stringify(action.config);
    
    if (isNew) {
      action.id = this.generateUuid();
      
      const insertQuery = `INSERT INTO ${actionsTable} 
        (id, route_id, type, config, order, enabled) 
        VALUES (?, ?, ?, ?, ?, ?)`;
      
      await this.dbPlugin.execute(insertQuery, [
        action.id, 
        action.routeId, 
        action.type, 
        config, 
        action.order, 
        action.enabled ? 1 : 0
      ]);
    } else {
      // Save previous version to history if versioning is enabled
      if (this.settings.workflow.dynamicLoading.versionHistory) {
        await this.saveEntityVersion('action', action.id);
      }
      
      const updateQuery = `UPDATE ${actionsTable} 
        SET route_id = ?, type = ?, config = ?, order = ?, enabled = ?
        WHERE id = ?`;
      
      await this.dbPlugin.execute(updateQuery, [
        action.routeId, 
        action.type, 
        config, 
        action.order, 
        action.enabled ? 1 : 0,
        action.id
      ]);
    }
    
    // Refresh the route that contains this action
    if (this.initialized) {
      const route = await this.getRouteByActionId(action.id);
      if (route) {
        await this.refreshRoute(route.id);
      }
    }
    
    return action.id;
  }
  
  public async deleteWorkflowRouter(routerId: string): Promise<boolean> {
    const routersTable = this.settings.workflow.dynamicLoading.tables?.routers || 'workflow_routers';
    
    // Save to history before deleting
    if (this.settings.workflow.dynamicLoading.versionHistory) {
      await this.saveEntityVersion('router', routerId);
    }
    
    const deleteQuery = `DELETE FROM ${routersTable} WHERE id = ?`;
    const result = await this.dbPlugin.execute(deleteQuery, [routerId]);
    
    // Remove from memory
    this.routers.delete(routerId);
    
    return result && result.affectedRows > 0;
  }
  
  public async deleteWorkflowRoute(routeId: string): Promise<boolean> {
    const routesTable = this.settings.workflow.dynamicLoading.tables?.routes || 'workflow_routes';
    
    // Save to history before deleting
    if (this.settings.workflow.dynamicLoading.versionHistory) {
      await this.saveEntityVersion('route', routeId);
    }
    
    const deleteQuery = `DELETE FROM ${routesTable} WHERE id = ?`;
    const result = await this.dbPlugin.execute(deleteQuery, [routeId]);
    
    // Remove from memory
    this.routes.delete(routeId);
    
    return result && result.affectedRows > 0;
  }
  
  public async deleteWorkflowAction(actionId: string): Promise<boolean> {
    const actionsTable = this.settings.workflow.dynamicLoading.tables?.actions || 'workflow_actions';
    
    // Save to history before deleting
    if (this.settings.workflow.dynamicLoading.versionHistory) {
      await this.saveEntityVersion('action', actionId);
    }
    
    // Get the route ID before deleting the action
    const route = await this.getRouteByActionId(actionId);
    
    const deleteQuery = `DELETE FROM ${actionsTable} WHERE id = ?`;
    const result = await this.dbPlugin.execute(deleteQuery, [actionId]);
    
    // Refresh the route that contained this action
    if (this.initialized && route) {
      await this.refreshRoute(route.id);
    }
    
    return result && result.affectedRows > 0;
  }
  
  private async saveEntityVersion(entityType: 'router' | 'route' | 'action', entityId: string): Promise<void> {
    if (!this.settings.workflow.dynamicLoading.versionHistory) {
      return;
    }
    
    const versionsTable = this.settings.workflow.dynamicLoading.tables?.versions || 'workflow_versions';
    const tableName = this.getTableForEntityType(entityType);
    
    // Get current entity data
    const entity = await this.dbPlugin.queryOne(`SELECT * FROM ${tableName} WHERE id = ?`, [entityId]);
    if (!entity) {
      return;
    }
    
    // Create version number based on timestamp
    const versionTimestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '').split('.')[0];
    const version = `v${versionTimestamp}`;
    
    // Store entity data in versions table
    let insertQuery = '';
    let params = [];
    
    switch (entityType) {
      case 'router':
        insertQuery = `INSERT INTO ${versionsTable} 
          (id, entity_type, entity_id, version, router_data, created_at) 
          VALUES (?, ?, ?, ?, ?, NOW())`;
        params = [
          this.generateUuid(),
          entityType,
          entityId,
          version,
          JSON.stringify(entity)
        ];
        break;
      case 'route':
        insertQuery = `INSERT INTO ${versionsTable} 
          (id, entity_type, entity_id, router_id, version, route_data, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW())`;
        params = [
          this.generateUuid(),
          entityType,
          entityId,
          entity.router_id,
          version,
          JSON.stringify(entity)
        ];
        break;
      case 'action':
        insertQuery = `INSERT INTO ${versionsTable} 
          (id, entity_type, entity_id, route_id, version, action_data, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW())`;
        params = [
          this.generateUuid(),
          entityType,
          entityId,
          entity.route_id,
          version,
          JSON.stringify(entity)
        ];
        break;
    }
    
    await this.dbPlugin.execute(insertQuery, params);
  }
  
  private getTableForEntityType(entityType: 'router' | 'route' | 'action'): string {
    switch (entityType) {
      case 'router':
        return this.settings.workflow.dynamicLoading.tables?.routers || 'workflow_routers';
      case 'route':
        return this.settings.workflow.dynamicLoading.tables?.routes || 'workflow_routes';
      case 'action':
        return this.settings.workflow.dynamicLoading.tables?.actions || 'workflow_actions';
    }
  }
  
  private async getRouteByActionId(actionId: string): Promise<{ id: string, routerId: string } | null> {
    const actionsTable = this.settings.workflow.dynamicLoading.tables?.actions || 'workflow_actions';
    const routesTable = this.settings.workflow.dynamicLoading.tables?.routes || 'workflow_routes';
    
    const query = `
      SELECT r.id, r.router_id as routerId 
      FROM ${routesTable} r
      JOIN ${actionsTable} a ON a.route_id = r.id
      WHERE a.id = ?
    `;
    
    return await this.dbPlugin.queryOne(query, [actionId]);
  }
  
  private async refreshRouter(routerId: string): Promise<void> {
    // Remove existing router
    this.routers.delete(routerId);
    
    // Load updated router
    const routersTable = this.settings.workflow.dynamicLoading.tables?.routers || 'workflow_routers';
    const routerQuery = `SELECT * FROM ${routersTable} WHERE id = ? AND enabled = 1`;
    
    const dbRouter: DbWorkflowRouter = await this.dbPlugin.queryOne(routerQuery, [routerId]);
    
    if (dbRouter) {
      const router = new WorkflowRouter(dbRouter.path);
      router.name = dbRouter.name;
      if (dbRouter.description) {
        router.description = dbRouter.description;
      }
      
      this.routers.set(dbRouter.id, router);
      
      // Reload routes for this router
      await this.refreshRoutesForRouter(routerId);
    }
  }
  
  private async refreshRoutesForRouter(routerId: string): Promise<void> {
    const routesTable = this.settings.workflow.dynamicLoading.tables?.routes || 'workflow_routes';
    const routesQuery = `SELECT * FROM ${routesTable} WHERE router_id = ? AND enabled = 1`;
    
    const dbRoutes: DbWorkflowRoute[] = await this.dbPlugin.query(routesQuery, [routerId]);
    
    // Remove existing routes for this router
    for (const [routeId, route] of this.routes.entries()) {
      if (route.router.getPath() === this.routers.get(routerId)?.getPath()) {
        this.routes.delete(routeId);
      }
    }
    
    const router = this.routers.get(routerId);
    if (!router) return;
    
    // Load updated routes
    for (const dbRoute of dbRoutes) {
      const route = new WorkflowRoute(router, dbRoute.path);
      
      // Set route properties
      if (dbRoute.summary) route.sum(dbRoute.summary);
      if (dbRoute.description) route.desc(dbRoute.description);
      if (dbRoute.tags) route.tag(dbRoute.tags);
      if (dbRoute.isDeprecated) route.deprecated();
      
      // Set HTTP methods
      const methods = typeof dbRoute.methods === 'string' 
        ? JSON.parse(dbRoute.methods) 
        : dbRoute.methods;
        
      for (const method of methods) {
        route.method(method);
      }
      
      this.routes.set(dbRoute.id, route);
      router.add(route);
      
      // Reload actions for this route
      await this.refreshActionsForRoute(dbRoute.id);
    }
  }
  
  private async refreshActionsForRoute(routeId: string): Promise<void> {
    const actionsTable = this.settings.workflow.dynamicLoading.tables?.actions || 'workflow_actions';
    const actionsQuery = `SELECT * FROM ${actionsTable} WHERE route_id = ? AND enabled = 1 ORDER BY \`order\``;
    
    const dbActions: DbWorkflowAction[] = await this.dbPlugin.query(actionsQuery, [routeId]);
    
    const route = this.routes.get(routeId);
    if (!route) return;
    
    // Clear existing actions
    route.actions = [];
    
    // Load updated actions
    for (const dbAction of dbActions) {
      try {
        const action = this.createAction(dbAction.type, dbAction.config);
        if (action) {
          route.action(action);
        }
      } catch (error) {
        console.error(`Failed to create action ${dbAction.id} of type ${dbAction.type}:`, error);
      }
    }
  }
  
  private async loadVersionHistory(): Promise<void> {
    if (!this.settings.workflow.dynamicLoading.versionHistory) {
      return;
    }
    
    const versionsTable = this.settings.workflow.dynamicLoading.tables?.versions || 'workflow_versions';
    const versionsQuery = `SELECT * FROM ${versionsTable} ORDER BY created_at DESC`;
    
    try {
      const versions = await this.dbPlugin.query(versionsQuery);
      
      // Group versions by entity ID
      for (const version of versions) {
        const entityId = version.entity_id;
        if (!this.versionInfo.has(entityId)) {
          this.versionInfo.set(entityId, []);
        }
        
        this.versionInfo.get(entityId)?.push({
          id: version.id,
          entity_type: version.entity_type,
          routerId: version.router_id,
          routeId: version.route_id,
          version: version.version,
          config: this.getVersionData(version),
          created_at: version.created_at
        });
      }
    } catch (error) {
      console.error('Failed to load workflow version history:', error);
    }
  }
  
  private getVersionData(version: any): any {
    if (version.router_data) {
      return JSON.parse(version.router_data);
    } else if (version.route_data) {
      return JSON.parse(version.route_data);
    } else if (version.action_data) {
      return JSON.parse(version.action_data);
    }
    return null;
  }
  
  public getEntityVersions(entityType: 'router' | 'route' | 'action', entityId: string): WorkflowVersionInfo[] {
    return this.versionInfo.get(entityId) || [];
  }
  
  public async restoreVersion(versionId: string): Promise<boolean> {
    const versionsTable = this.settings.workflow.dynamicLoading.tables?.versions || 'workflow_versions';
    const versionQuery = `SELECT * FROM ${versionsTable} WHERE id = ?`;
    
    const version = await this.dbPlugin.queryOne(versionQuery, [versionId]);
    if (!version) {
      return false;
    }
    
    const entityType = version.entity_type;
    const entityId = version.entity_id;
    
    // Extract data based on entity type
    let data: any;
    if (version.router_data) {
      data = JSON.parse(version.router_data);
    } else if (version.route_data) {
      data = JSON.parse(version.route_data);
    } else if (version.action_data) {
      data = JSON.parse(version.action_data);
    }
    
    if (!data) {
      return false;
    }
    
    // Restore to appropriate table
    const tableName = this.getTableForEntityType(entityType as any);
    const updateFields = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => `${this.snakeToCamel(key)} = ?`)
      .join(', ');
    
    const updateQuery = `UPDATE ${tableName} SET ${updateFields} WHERE id = ?`;
    const values = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => data[key]);
    
    values.push(entityId);
    
    const result = await this.dbPlugin.execute(updateQuery, values);
    
    // Refresh in-memory data
    if (this.initialized) {
      switch (entityType) {
        case 'router':
          await this.refreshRouter(entityId);
          break;
        case 'route':
          await this.refreshRoute(entityId);
          break;
        case 'action':
          const route = await this.getRouteByActionId(entityId);
          if (route) {
            await this.refreshRoute(route.id);
          }
          break;
      }
    }
    
    return result && result.affectedRows > 0;
  }
  
  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  
  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  private async refreshRoute(routeId: string): Promise<void> {
    const routesTable = this.settings.workflow.dynamicLoading.tables?.routes || 'workflow_routes';
    const routeQuery = `SELECT * FROM ${routesTable} WHERE id = ? AND enabled = 1`;
    
    const dbRoute: DbWorkflowRoute = await this.dbPlugin.queryOne(routeQuery, [routeId]);
    if (!dbRoute) {
      // Route no longer exists or is disabled, remove from memory
      this.routes.delete(routeId);
      return;
    }
    
    const router = this.routers.get(dbRoute.routerId);
    if (!router) {
      // Router doesn't exist in memory, reload it
      await this.refreshRouter(dbRoute.routerId);
      return;
    }
    
    // Remove existing route
    this.routes.delete(routeId);
    
    // Create new route
    const route = new WorkflowRoute(router, dbRoute.path);
    route.id = dbRoute.id; // Set the database ID for metrics tracking
    
    // Set route properties
    if (dbRoute.summary) route.sum(dbRoute.summary);
    if (dbRoute.description) route.desc(dbRoute.description);
    if (dbRoute.tags) route.tag(dbRoute.tags);
    if (dbRoute.isDeprecated) route.deprecated();
    
    // Set HTTP methods
    const methods = typeof dbRoute.methods === 'string' 
      ? JSON.parse(dbRoute.methods) 
      : dbRoute.methods;
      
    for (const method of methods) {
      route.method(method);
    }
    
    // Enable metrics tracking if configured
    if (this.metricsEnabled) {
      route.enableMetrics(this.dbPlugin, this.settings.workflow.dynamicLoading.tables?.metrics || 'workflow_metrics');
    }
    
    this.routes.set(dbRoute.id, route);
    router.add(route);
    
    // Reload actions for this route
    await this.refreshActionsForRoute(dbRoute.id);
  }
  
  // Add a method to get route metrics
  public async getRouteMetrics(routeId: string): Promise<any> {
    if (!this.metricsEnabled) {
      return null;
    }
    
    const metricsTable = this.settings.workflow.dynamicLoading.tables?.metrics || 'workflow_metrics';
    
    try {
      const metrics = await this.dbPlugin.queryOne(
        `SELECT * FROM ${metricsTable} WHERE route_id = ?`,
        [routeId]
      );
      
      return metrics;
    } catch (error) {
      console.error(`Failed to get metrics for route ${routeId}:`, error);
      return null;
    }
  }
  
  // Add a method to get all route metrics
  public async getAllRouteMetrics(): Promise<any[]> {
    if (!this.metricsEnabled) {
      return [];
    }
    
    const metricsTable = this.settings.workflow.dynamicLoading.tables?.metrics || 'workflow_metrics';
    const routesTable = this.settings.workflow.dynamicLoading.tables?.routes || 'workflow_routes';
    
    try {
      const metrics = await this.dbPlugin.query(
        `SELECT m.*, r.path, r.methods, r.summary 
         FROM ${metricsTable} m
         JOIN ${routesTable} r ON m.route_id = r.id
         ORDER BY m.total_executions DESC`
      );
      
      return metrics;
    } catch (error) {
      console.error('Failed to get all route metrics:', error);
      return [];
    }
  }
  
  // Add methods to reset metrics
  public async resetRouteMetrics(routeId: string): Promise<boolean> {
    if (!this.metricsEnabled) {
      return false;
    }
    
    const metricsTable = this.settings.workflow.dynamicLoading.tables?.metrics || 'workflow_metrics';
    
    try {
      await this.dbPlugin.execute(
        `DELETE FROM ${metricsTable} WHERE route_id = ?`,
        [routeId]
      );
      
      return true;
    } catch (error) {
      console.error(`Failed to reset metrics for route ${routeId}:`, error);
      return false;
    }
  }
  
  public async resetAllMetrics(): Promise<boolean> {
    if (!this.metricsEnabled) {
      return false;
    }
    
    const metricsTable = this.settings.workflow.dynamicLoading.tables?.metrics || 'workflow_metrics';
    
    try {
      await this.dbPlugin.execute(`TRUNCATE TABLE ${metricsTable}`);
      return true;
    } catch (error) {
      console.error('Failed to reset all metrics:', error);
      return false;
    }
  }
} 