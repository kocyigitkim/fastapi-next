import { WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRoute } from "../WorkflowRoute";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

export class RetryAction extends WorkflowRouteAction {
  private action: WorkflowRoute;

  constructor(
    private actionBuilder: (route: WorkflowRoute) => WorkflowRoute,
    private maxAttempts: number = 3,
    private delayMs: number = 1000,
    private retryCondition?: (result: WorkflowRouteActionResult) => boolean
  ) {
    super("retry");
    this.action = actionBuilder(new WorkflowRoute(null, ""));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldRetry(result: WorkflowRouteActionResult): boolean {
    if (this.retryCondition) {
      return this.retryCondition(result);
    }
    // Default condition: retry if action failed
    return !result.success;
  }

  public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    let lastResult: WorkflowRouteActionResult;
    let attempts = 0;

    do {
      if (attempts > 0) {
        await this.sleep(this.delayMs);
      }

      const executionResult = await this.action.execute(context.nextContext, context);
      lastResult = this.action.buildActionResult(executionResult);
      attempts++;

      // Break if successful or max attempts reached
      if (!this.shouldRetry(lastResult) || attempts >= this.maxAttempts) {
        break;
      }
    } while (attempts < this.maxAttempts);

    // Add retry metadata
    const retryMetadata = {
      attempts,
      maxAttempts: this.maxAttempts,
      succeeded: lastResult.success
    };

    if (lastResult.success) {
      const result = new WorkflowRouteActionResult().setSuccess({
        ...lastResult.data,
        retry: retryMetadata
      });
      return result;
    } else {
      const result = new WorkflowRouteActionResult()
        .setError(`Action failed after ${attempts} attempts: ${lastResult.error}`, lastResult.status || 500);
      result.data = {
        ...lastResult.data,
        retry: retryMetadata
      };
      return result;
    }
  }
} 