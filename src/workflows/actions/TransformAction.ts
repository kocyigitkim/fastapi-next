import { WorkflowExecuteContext, CurrentArgsSource } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

type TransformFunction = (data: any, context: WorkflowExecuteContext) => any | Promise<any>;

export class TransformAction extends WorkflowRouteAction {
  constructor(
    private source: CurrentArgsSource,
    private transformFn: TransformFunction | Array<TransformFunction>,
    private sourceKey?: string
  ) {
    super("transform");
  }

  public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    try {
      // Get source data
      let sourceData = context.getCurrentArgs(this.source);
      
      // If sourceKey is specified, extract the specific property
      if (this.sourceKey) {
        sourceData = context.queryParam(sourceData, this.sourceKey);
      }
      
      // Apply transformations
      let transformedData = sourceData;
      
      if (Array.isArray(this.transformFn)) {
        // Apply multiple transformations in sequence
        for (const transform of this.transformFn) {
          transformedData = await Promise.resolve(transform(transformedData, context));
        }
      } else {
        // Apply single transformation
        transformedData = await Promise.resolve(this.transformFn(sourceData, context));
      }
      
      return new WorkflowRouteActionResult().setSuccess(transformedData);
    } catch (error) {
      return new WorkflowRouteActionResult().setError(
        `Transform failed: ${error.message}`,
        500
      );
    }
  }
} 