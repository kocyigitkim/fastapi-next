import { WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

export class AuthorizeAction extends WorkflowRouteAction {
    constructor(private anonymous: boolean, private custom: Function) {
        super("authorize");
        this.definitionOnly = true;
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );

        let authorize = context.nextContext.app.options.authorization;

        let error = undefined;
        const isAuthorized = await authorize.check(context.nextContext, {
            path: context.workflow.getPath(),
        }).catch(err => {
            error = err;
        });

        if (error) {
            return result.setError(error, 401);
        }
        else {
            return result.setSuccess(isAuthorized);
        }

        return result;
    }
}

