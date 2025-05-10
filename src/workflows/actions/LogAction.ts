import { WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

export class LogAction extends WorkflowRouteAction {
  constructor(
    private message?: string,
    private logLevel: 'info' | 'warn' | 'error' | 'debug' = 'info',
    private includeContext: boolean = false,
    private contextPath?: string
  ) {
    super("log");
  }

  public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    const result = new WorkflowRouteActionResult();
    
    try {
      let logData: any = this.message || '';
      
      if (this.includeContext) {
        if (this.contextPath) {
          logData = {
            message: this.message,
            contextData: context.queryParam(context, this.contextPath)
          };
        } else {
          logData = {
            message: this.message,
            lastResult: context.actionResults[context.actionResults.length - 1]?.result,
            parameters: context.parameters
          };
        }
      }
      
      // Log to console based on log level
      switch (this.logLevel) {
        case 'warn':
          console.warn(logData);
          break;
        case 'error':
          console.error(logData);
          break;
        case 'debug':
          console.debug(logData);
          break;
        default:
          console.log(logData);
      }
      
      return result.setSuccess(logData);
    } catch (error) {
      return result.setError(`Log action failed: ${error.message}`, 500);
    }
  }
} 