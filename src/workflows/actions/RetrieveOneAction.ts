import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";


export class RetrieveOneAction extends WorkflowRouteAction {
    constructor(private dbSource: string, private tableName: string, private where: any, private projection?: string[]) {
        super("retrieveOne");
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );
        const args = context.getCurrentArgs(CurrentArgsSource.all);

        const db = context.nextContext?.[this.dbSource];

        if (!db) {
            return result.setError('Database source not found', 500);
        }
        let dbQuery: any = db(this.tableName);

        let whereCondition = context.map(this.where, args);
        dbQuery = dbQuery.where(whereCondition);
        if (this.projection?.length > 0) {
            dbQuery = dbQuery.select(this.projection);
        }
        let error = undefined;
        let dbResult = await dbQuery.first().catch(err => {
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
