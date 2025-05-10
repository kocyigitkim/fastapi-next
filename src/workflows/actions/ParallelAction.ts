import { WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRoute } from "../WorkflowRoute";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

export type ActionBuilder = (route: WorkflowRoute) => WorkflowRoute;

export class ParallelAction extends WorkflowRouteAction {
  private actions: WorkflowRoute[] = [];

  constructor(
    private actionBuilders: ActionBuilder[],
    private options: {
      failFast?: boolean;
      maxConcurrent?: number;
    } = {}
  ) {
    super("parallel");
    this.actions = actionBuilders.map(builder => builder(new WorkflowRoute(null, "")));
  }

  public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    try {
      const { failFast = false, maxConcurrent } = this.options;
      const results: any[] = [];
      let hasErrors = false;

      if (maxConcurrent && maxConcurrent > 0 && maxConcurrent < this.actions.length) {
        // Execute with concurrency limit
        const chunks = [];
        for (let i = 0; i < this.actions.length; i += maxConcurrent) {
          chunks.push(this.actions.slice(i, i + maxConcurrent));
        }

        for (const chunk of chunks) {
          const chunkResults = await Promise.all(
            chunk.map(async (action, index) => {
              try {
                const result = await action.execute(context.nextContext, context);
                return {
                  success: result.success,
                  result: action.buildActionResult(result),
                  index: index
                };
              } catch (error) {
                return {
                  success: false,
                  result: new WorkflowRouteActionResult().setError(error.message, 500),
                  index: index
                };
              }
            })
          );

          results.push(...chunkResults);

          // Check if any failed and we should fail fast
          if (failFast && chunkResults.some(r => !r.success)) {
            hasErrors = true;
            break;
          }
        }
      } else {
        // Execute all in parallel
        const actionResults = await Promise.all(
          this.actions.map(async (action, index) => {
            try {
              const result = await action.execute(context.nextContext, context);
              return {
                success: result.success,
                result: action.buildActionResult(result),
                index: index
              };
            } catch (error) {
              return {
                success: false,
                result: new WorkflowRouteActionResult().setError(error.message, 500),
                index: index
              };
            }
          })
        );

        results.push(...actionResults);
        hasErrors = actionResults.some(r => !r.success);
      }

      // Check if any actions failed
      if (hasErrors) {
        const errors = results
          .filter(r => !r.success)
          .map(r => `Action ${r.index}: ${r.result.error}`)
          .join("; ");

        return new WorkflowRouteActionResult().setError(
          `One or more parallel actions failed: ${errors}`,
          500
        );
      }

      // All actions succeeded
      return new WorkflowRouteActionResult().setSuccess(
        results.map(r => r.result.data)
      );
    } catch (error) {
      return new WorkflowRouteActionResult().setError(
        `Parallel execution failed: ${error.message}`,
        500
      );
    }
  }
} 