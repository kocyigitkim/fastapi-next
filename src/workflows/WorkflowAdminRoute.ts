import { NextContextBase } from "..";
import { DynamicWorkflowLoader } from "./DynamicWorkflowLoader";

/**
 * WorkflowAdminRoute - Provides REST API routes for managing dynamic workflows
 * 
 * This handler exposes endpoints for creating, updating, deleting, and querying
 * workflow components (routers, routes, actions) as well as viewing performance metrics.
 */
export class WorkflowAdminRoute {
  constructor(private dynamicLoader: DynamicWorkflowLoader) {}

  async handleRequest(path: string, method: string, context: NextContextBase): Promise<any> {
    const pathParts = path.split('/').filter(p => p);
    
    // Route to appropriate handler based on path
    try {
      // GET /admin/workflows/routers - List all routers
      if (method === 'GET' && pathParts[2] === 'routers' && !pathParts[3]) {
        return await this.listRouters();
      }
      
      // GET /admin/workflows/routers/:id - Get router by ID
      if (method === 'GET' && pathParts[2] === 'routers' && pathParts[3]) {
        return await this.getRouter(pathParts[3]);
      }
      
      // POST /admin/workflows/routers - Create new router
      if (method === 'POST' && pathParts[2] === 'routers' && !pathParts[3]) {
        return await this.createRouter(context.body);
      }
      
      // PUT /admin/workflows/routers/:id - Update router
      if (method === 'PUT' && pathParts[2] === 'routers' && pathParts[3]) {
        return await this.updateRouter(pathParts[3], context.body);
      }
      
      // DELETE /admin/workflows/routers/:id - Delete router
      if (method === 'DELETE' && pathParts[2] === 'routers' && pathParts[3]) {
        return await this.deleteRouter(pathParts[3]);
      }
      
      // Routes for managing workflow routes
      
      // GET /admin/workflows/routes - List all routes
      if (method === 'GET' && pathParts[2] === 'routes' && !pathParts[3]) {
        return await this.listRoutes(context.query);
      }
      
      // GET /admin/workflows/routes/:id - Get route by ID
      if (method === 'GET' && pathParts[2] === 'routes' && pathParts[3] && !pathParts[4]) {
        return await this.getRoute(pathParts[3]);
      }
      
      // POST /admin/workflows/routes - Create new route
      if (method === 'POST' && pathParts[2] === 'routes' && !pathParts[3]) {
        return await this.createRoute(context.body);
      }
      
      // PUT /admin/workflows/routes/:id - Update route
      if (method === 'PUT' && pathParts[2] === 'routes' && pathParts[3]) {
        return await this.updateRoute(pathParts[3], context.body);
      }
      
      // DELETE /admin/workflows/routes/:id - Delete route
      if (method === 'DELETE' && pathParts[2] === 'routes' && pathParts[3]) {
        return await this.deleteRoute(pathParts[3]);
      }
      
      // Routes for managing workflow actions
      
      // GET /admin/workflows/routes/:routeId/actions - List actions for route
      if (method === 'GET' && pathParts[2] === 'routes' && pathParts[3] && pathParts[4] === 'actions' && !pathParts[5]) {
        return await this.listActions(pathParts[3]);
      }
      
      // GET /admin/workflows/actions/:id - Get action by ID
      if (method === 'GET' && pathParts[2] === 'actions' && pathParts[3]) {
        return await this.getAction(pathParts[3]);
      }
      
      // POST /admin/workflows/routes/:routeId/actions - Create new action
      if (method === 'POST' && pathParts[2] === 'routes' && pathParts[3] && pathParts[4] === 'actions') {
        return await this.createAction(pathParts[3], context.body);
      }
      
      // PUT /admin/workflows/actions/:id - Update action
      if (method === 'PUT' && pathParts[2] === 'actions' && pathParts[3]) {
        return await this.updateAction(pathParts[3], context.body);
      }
      
      // DELETE /admin/workflows/actions/:id - Delete action
      if (method === 'DELETE' && pathParts[2] === 'actions' && pathParts[3]) {
        return await this.deleteAction(pathParts[3]);
      }
      
      // Routes for managing workflow versions
      
      // GET /admin/workflows/versions/:entityType/:entityId - Get version history
      if (method === 'GET' && pathParts[2] === 'versions' && pathParts[3] && pathParts[4]) {
        return await this.getVersionHistory(pathParts[3], pathParts[4]);
      }
      
      // POST /admin/workflows/versions/:versionId/restore - Restore from version
      if (method === 'POST' && pathParts[2] === 'versions' && pathParts[3] && pathParts[4] === 'restore') {
        return await this.restoreVersion(pathParts[3]);
      }
      
      // Routes for metrics
      
      // GET /admin/workflows/metrics - Get all metrics
      if (method === 'GET' && pathParts[2] === 'metrics' && !pathParts[3]) {
        return await this.getAllMetrics();
      }
      
      // GET /admin/workflows/metrics/:routeId - Get metrics for route
      if (method === 'GET' && pathParts[2] === 'metrics' && pathParts[3] && !pathParts[4]) {
        return await this.getRouteMetrics(pathParts[3]);
      }
      
      // DELETE /admin/workflows/metrics/:routeId - Reset metrics for route
      if (method === 'DELETE' && pathParts[2] === 'metrics' && pathParts[3]) {
        return await this.resetRouteMetrics(pathParts[3]);
      }
      
      // DELETE /admin/workflows/metrics - Reset all metrics
      if (method === 'DELETE' && pathParts[2] === 'metrics' && !pathParts[3]) {
        return await this.resetAllMetrics();
      }
      
      return {
        success: false,
        error: 'Not found',
        status: 404
      };
    } catch (error) {
      console.error('Error in workflow admin route:', error);
      return {
        success: false,
        error: error.message || 'Internal server error',
        status: 500
      };
    }
  }
  
  // Router management
  
  private async listRouters() {
    const query = `SELECT * FROM workflow_routers ORDER BY name`;
    const routers = await this.dynamicLoader.dbPlugin.query(query);
    
    return {
      success: true,
      data: routers,
      status: 200
    };
  }
  
  private async getRouter(routerId: string) {
    const query = `SELECT * FROM workflow_routers WHERE id = ?`;
    const router = await this.dynamicLoader.dbPlugin.queryOne(query, [routerId]);
    
    if (!router) {
      return {
        success: false,
        error: 'Router not found',
        status: 404
      };
    }
    
    return {
      success: true,
      data: router,
      status: 200
    };
  }
  
  private async createRouter(routerData: any) {
    // Validate router data
    if (!routerData.name || !routerData.path) {
      return {
        success: false,
        error: 'Name and path are required',
        status: 400
      };
    }
    
    const routerId = await this.dynamicLoader.saveWorkflowRouter({
      id: null,
      name: routerData.name,
      path: routerData.path,
      description: routerData.description,
      enabled: routerData.enabled !== false
    });
    
    return {
      success: true,
      data: { id: routerId },
      status: 201
    };
  }
  
  private async updateRouter(routerId: string, routerData: any) {
    // Check if router exists
    const existingRouter = await this.dynamicLoader.dbPlugin.queryOne(
      `SELECT * FROM workflow_routers WHERE id = ?`, 
      [routerId]
    );
    
    if (!existingRouter) {
      return {
        success: false,
        error: 'Router not found',
        status: 404
      };
    }
    
    await this.dynamicLoader.saveWorkflowRouter({
      id: routerId,
      name: routerData.name || existingRouter.name,
      path: routerData.path || existingRouter.path,
      description: routerData.description !== undefined ? routerData.description : existingRouter.description,
      enabled: routerData.enabled !== undefined ? routerData.enabled : existingRouter.enabled
    });
    
    return {
      success: true,
      status: 200
    };
  }
  
  private async deleteRouter(routerId: string) {
    const success = await this.dynamicLoader.deleteWorkflowRouter(routerId);
    
    if (!success) {
      return {
        success: false,
        error: 'Router not found or could not be deleted',
        status: 404
      };
    }
    
    return {
      success: true,
      status: 200
    };
  }
  
  // Route management
  
  private async listRoutes(queryParams: any) {
    let query = `SELECT * FROM workflow_routes`;
    const params = [];
    
    if (queryParams.routerId) {
      query += ` WHERE router_id = ?`;
      params.push(queryParams.routerId);
    }
    
    query += ` ORDER BY path`;
    
    const routes = await this.dynamicLoader.dbPlugin.query(query, params);
    
    return {
      success: true,
      data: routes,
      status: 200
    };
  }
  
  private async getRoute(routeId: string) {
    const query = `SELECT * FROM workflow_routes WHERE id = ?`;
    const route = await this.dynamicLoader.dbPlugin.queryOne(query, [routeId]);
    
    if (!route) {
      return {
        success: false,
        error: 'Route not found',
        status: 404
      };
    }
    
    return {
      success: true,
      data: route,
      status: 200
    };
  }
  
  private async createRoute(routeData: any) {
    // Validate route data
    if (!routeData.routerId || !routeData.path || !routeData.methods) {
      return {
        success: false,
        error: 'Router ID, path, and methods are required',
        status: 400
      };
    }
    
    const routeId = await this.dynamicLoader.saveWorkflowRoute({
      id: null,
      routerId: routeData.routerId,
      path: routeData.path,
      methods: routeData.methods,
      summary: routeData.summary,
      description: routeData.description,
      tags: routeData.tags,
      isDeprecated: routeData.isDeprecated || false,
      enabled: routeData.enabled !== false
    });
    
    return {
      success: true,
      data: { id: routeId },
      status: 201
    };
  }
  
  private async updateRoute(routeId: string, routeData: any) {
    // Check if route exists
    const existingRoute = await this.dynamicLoader.dbPlugin.queryOne(
      `SELECT * FROM workflow_routes WHERE id = ?`, 
      [routeId]
    );
    
    if (!existingRoute) {
      return {
        success: false,
        error: 'Route not found',
        status: 404
      };
    }
    
    // Parse methods from JSON if stored as string
    const existingMethods = typeof existingRoute.methods === 'string' 
      ? JSON.parse(existingRoute.methods) 
      : existingRoute.methods;
    
    await this.dynamicLoader.saveWorkflowRoute({
      id: routeId,
      routerId: routeData.routerId || existingRoute.router_id,
      path: routeData.path || existingRoute.path,
      methods: routeData.methods || existingMethods,
      summary: routeData.summary !== undefined ? routeData.summary : existingRoute.summary,
      description: routeData.description !== undefined ? routeData.description : existingRoute.description,
      tags: routeData.tags !== undefined ? routeData.tags : existingRoute.tags,
      isDeprecated: routeData.isDeprecated !== undefined ? routeData.isDeprecated : existingRoute.is_deprecated,
      enabled: routeData.enabled !== undefined ? routeData.enabled : existingRoute.enabled
    });
    
    return {
      success: true,
      status: 200
    };
  }
  
  private async deleteRoute(routeId: string) {
    const success = await this.dynamicLoader.deleteWorkflowRoute(routeId);
    
    if (!success) {
      return {
        success: false,
        error: 'Route not found or could not be deleted',
        status: 404
      };
    }
    
    return {
      success: true,
      status: 200
    };
  }
  
  // Action management
  
  private async listActions(routeId: string) {
    const query = `SELECT * FROM workflow_actions WHERE route_id = ? ORDER BY \`order\``;
    const actions = await this.dynamicLoader.dbPlugin.query(query, [routeId]);
    
    return {
      success: true,
      data: actions,
      status: 200
    };
  }
  
  private async getAction(actionId: string) {
    const query = `SELECT * FROM workflow_actions WHERE id = ?`;
    const action = await this.dynamicLoader.dbPlugin.queryOne(query, [actionId]);
    
    if (!action) {
      return {
        success: false,
        error: 'Action not found',
        status: 404
      };
    }
    
    return {
      success: true,
      data: action,
      status: 200
    };
  }
  
  private async createAction(routeId: string, actionData: any) {
    // Validate action data
    if (!actionData.type || actionData.order === undefined) {
      return {
        success: false,
        error: 'Type and order are required',
        status: 400
      };
    }
    
    const config = actionData.config || {};
    
    const actionId = await this.dynamicLoader.saveWorkflowAction({
      id: null,
      routeId: routeId,
      type: actionData.type,
      config: config,
      order: actionData.order,
      enabled: actionData.enabled !== false
    });
    
    return {
      success: true,
      data: { id: actionId },
      status: 201
    };
  }
  
  private async updateAction(actionId: string, actionData: any) {
    // Check if action exists
    const existingAction = await this.dynamicLoader.dbPlugin.queryOne(
      `SELECT * FROM workflow_actions WHERE id = ?`, 
      [actionId]
    );
    
    if (!existingAction) {
      return {
        success: false,
        error: 'Action not found',
        status: 404
      };
    }
    
    // Parse config from JSON if stored as string
    const existingConfig = typeof existingAction.config === 'string' 
      ? JSON.parse(existingAction.config) 
      : existingAction.config;
    
    await this.dynamicLoader.saveWorkflowAction({
      id: actionId,
      routeId: actionData.routeId || existingAction.route_id,
      type: actionData.type || existingAction.type,
      config: actionData.config || existingConfig,
      order: actionData.order !== undefined ? actionData.order : existingAction.order,
      enabled: actionData.enabled !== undefined ? actionData.enabled : existingAction.enabled
    });
    
    return {
      success: true,
      status: 200
    };
  }
  
  private async deleteAction(actionId: string) {
    const success = await this.dynamicLoader.deleteWorkflowAction(actionId);
    
    if (!success) {
      return {
        success: false,
        error: 'Action not found or could not be deleted',
        status: 404
      };
    }
    
    return {
      success: true,
      status: 200
    };
  }
  
  // Version management
  
  private async getVersionHistory(entityType: string, entityId: string) {
    if (!['router', 'route', 'action'].includes(entityType)) {
      return {
        success: false,
        error: 'Invalid entity type',
        status: 400
      };
    }
    
    const versions = this.dynamicLoader.getEntityVersions(entityType as any, entityId);
    
    return {
      success: true,
      data: versions,
      status: 200
    };
  }
  
  private async restoreVersion(versionId: string) {
    const success = await this.dynamicLoader.restoreVersion(versionId);
    
    if (!success) {
      return {
        success: false,
        error: 'Version not found or could not be restored',
        status: 404
      };
    }
    
    return {
      success: true,
      status: 200
    };
  }
  
  // Metrics management
  
  private async getAllMetrics() {
    const metrics = await this.dynamicLoader.getAllRouteMetrics();
    
    return {
      success: true,
      data: metrics,
      status: 200
    };
  }
  
  private async getRouteMetrics(routeId: string) {
    const metrics = await this.dynamicLoader.getRouteMetrics(routeId);
    
    if (!metrics) {
      return {
        success: false,
        error: 'Metrics not found for route',
        status: 404
      };
    }
    
    return {
      success: true,
      data: metrics,
      status: 200
    };
  }
  
  private async resetRouteMetrics(routeId: string) {
    const success = await this.dynamicLoader.resetRouteMetrics(routeId);
    
    return {
      success,
      status: success ? 200 : 500
    };
  }
  
  private async resetAllMetrics() {
    const success = await this.dynamicLoader.resetAllMetrics();
    
    return {
      success,
      status: success ? 200 : 500
    };
  }
} 