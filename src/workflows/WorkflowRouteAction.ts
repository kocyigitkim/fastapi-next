import { WorkflowExecuteContext } from "./WorkflowExecuteContext";
import { WorkflowRouteActionResult } from "./WorkflowRouteActionResult";


export class WorkflowRouteAction {

    public name?: string;
    public definitionOnly: boolean = false;
    constructor(public command: string) { }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        return Promise.resolve(new WorkflowRouteActionResult().setError(
            "Not implemented",
            500
        ));
    }
}
