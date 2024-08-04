import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";


export class MapAction extends WorkflowRouteAction {
    constructor(private argsSource: CurrentArgsSource, private mapArgs: any) {
        super("map");
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );

        if (this.mapArgs) {
            const args = context.getCurrentArgs(this.argsSource || CurrentArgsSource.all);
            let mappedArgs = context.map(this.mapArgs, args);

            return result.setSuccess(mappedArgs);
        }

        return result;
    }
}
