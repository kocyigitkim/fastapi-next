import { WorkflowExecuteContext, CurrentArgsSource } from "../WorkflowExecuteContext";
import { WorkflowRoute } from "../WorkflowRoute";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

export type CaseValue = string | number | boolean;
export type CaseFunction = (ctx: WorkflowExecuteContext) => CaseValue | Promise<CaseValue>;
export type CaseHandler = (route: WorkflowRoute) => WorkflowRoute;

interface Case {
  value: CaseValue;
  handler: CaseHandler;
  route: WorkflowRoute;
}

export class SwitchAction extends WorkflowRouteAction {
  private cases: Case[] = [];
  private defaultHandler?: CaseHandler;
  private defaultRoute?: WorkflowRoute;

  constructor(
    private expression: string | CaseFunction,
    private source: CurrentArgsSource = CurrentArgsSource.all
  ) {
    super("switch");
  }

  public case(value: CaseValue, handler: CaseHandler): SwitchAction {
    const route = handler(new WorkflowRoute(null, ""));
    this.cases.push({ 
      value, 
      handler,
      route
    });
    return this;
  }

  public default(handler: CaseHandler): SwitchAction {
    this.defaultHandler = handler;
    this.defaultRoute = handler(new WorkflowRoute(null, ""));
    return this;
  }

  public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    try {
      // Determine the value to switch on
      let switchValue: CaseValue;
      
      if (typeof this.expression === 'function') {
        // If expression is a function, call it
        switchValue = await Promise.resolve(this.expression(context));
      } else {
        // If expression is a string, get value from context
        const sourceData = context.getCurrentArgs(this.source);
        switchValue = context.queryParam(sourceData, this.expression);
      }
      
      // Find matching case
      const matchedCase = this.cases.find(c => c.value === switchValue);
      let selectedRoute: WorkflowRoute | undefined;
      
      if (matchedCase) {
        selectedRoute = matchedCase.route;
      } else if (this.defaultRoute) {
        selectedRoute = this.defaultRoute;
      }
      
      if (selectedRoute) {
        const result = await selectedRoute.execute(context.nextContext, context);
        return selectedRoute.buildActionResult(result);
      }
      
      // No matching case and no default
      return new WorkflowRouteActionResult().setSuccess({
        switchValue,
        message: "No matching case found"
      });
    } catch (error) {
      return new WorkflowRouteActionResult().setError(
        `Switch execution failed: ${error.message}`,
        500
      );
    }
  }
} 