import { NextApplicationSettings } from "../NextApplicationSettings";
import { WorkflowRouter } from "./WorkflowRouter";
import { DynamicWorkflowLoader } from "./DynamicWorkflowLoader";

// Export core components
export * from "./WorkflowRouter";
export * from "./WorkflowRoute";
export * from "./WorkflowRouteAction";
export * from "./WorkflowRouteActionResult";
export * from "./WorkflowExecuteContext";
export * from "./WorkflowExecutionResult";
export * from "./DynamicWorkflowLoader";
export * from "./WorkflowAdminRoute";

// Export actions
export * from "./actions/AuthorizeAction";
export * from "./actions/CreateAction";
export * from "./actions/DeleteAction";
export * from "./actions/FilterAction";
export * from "./actions/IfAction";
export * from "./actions/MapAction";
export * from "./actions/RetrieveManyAction";
export * from "./actions/RetrieveOneAction";
export * from "./actions/StoredProcedureAction";
export * from "./actions/UpdateAction";
export * from "./actions/ValidateAction";
export * from "./actions/LogAction";
export * from "./actions/RetryAction";
export * from "./actions/TransformAction";
export * from "./actions/ParallelAction";
export * from "./actions/SwitchAction";
export * from "./actions/CacheAction";
export * from "./actions/LimiterAction";

// Workflow initialization function with support for dynamic loading
export async function initializeWorkflows(
  settings: NextApplicationSettings, 
  staticRouters: WorkflowRouter[] = []
): Promise<WorkflowRouter[]> {
  const routers = [...staticRouters];
  
  // If dynamic loading is enabled, load workflows from database
  if (settings.workflow?.dynamicLoading?.enabled) {
    try {
      const dynamicLoader = new DynamicWorkflowLoader(settings);
      const initialized = await dynamicLoader.initialize();
      
      if (initialized) {
        const dynamicRouters = dynamicLoader.getRouters();
        routers.push(...dynamicRouters);
        console.log(`Loaded ${dynamicRouters.length} dynamic workflow routers from database`);
      }
    } catch (error) {
      console.error('Failed to initialize dynamic workflows:', error);
    }
  }
  
  return routers;
} 