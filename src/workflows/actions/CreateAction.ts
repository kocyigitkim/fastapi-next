import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";


export class CreateAction extends WorkflowRouteAction {
    constructor(private dbSource: string, private tableName: string, private args: any, private returns?: string[]) {
        super("create");
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );
        const args = context.getCurrentArgs(CurrentArgsSource.all);
        const mappedArgs = context.map(this.args, args);
        const db = context.nextContext?.[this.dbSource];

        if (!db) {
            return result.setError('Database source not found', 500);
        }
        let error = undefined;
        let dbResult = await db(this.tableName).insert(mappedArgs).returning(this.returns || '*').catch(err => {
            error = err;
        });

        if (error) {
            return result.setError(error, 500);
        }
        else {
            return result.setSuccess(dbResult);
        }

        return result;
    }
}
