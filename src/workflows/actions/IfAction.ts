import { WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowExecutionResult } from "../WorkflowExecutionResult";
import { WorkflowRoute } from "../WorkflowRoute";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

export type IfCondition = (ctx: WorkflowExecuteContext) => (Promise<boolean> | boolean);
export type IfThen = (action: WorkflowRoute) => WorkflowRoute;
export type IfElse = (action: WorkflowRoute) => WorkflowRoute;

export class IfAction extends WorkflowRouteAction {
    trueAction: WorkflowRoute;
    falseAction: WorkflowRoute;
    constructor(private condition: IfCondition, private isTrue: IfThen, private isFalse: IfElse) {
        super("if");
        if (isTrue) {
            this.trueAction = isTrue(new WorkflowRoute(null, ""));
        }
        if (isFalse) {
            this.falseAction = isFalse(new WorkflowRoute(null, ""));
        }
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let condition = this.condition(context);
        if (condition instanceof Promise) condition = await condition.catch(err => false);
        let action = condition ? this.trueAction : this.falseAction;
        if (action) {
            let result = await action.execute(context.nextContext, context);
            return action.buildActionResult(result);
        }
        return new WorkflowRouteActionResult().setSuccess(undefined);
    }
}