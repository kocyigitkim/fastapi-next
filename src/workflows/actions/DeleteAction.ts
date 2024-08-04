import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";


export class DeleteAction extends WorkflowRouteAction {
    constructor(private dbSource: string, private tableName: string, private where: any, private returns?: string[], private signField?: string, private signFieldDeletedValue?: any) {
        super("create");
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );
        const args = context.getCurrentArgs(CurrentArgsSource.all);
        const whereCondition = context.map(this.where, args);
        const db = context.nextContext?.[this.dbSource];

        if (!db) {
            return result.setError('Database source not found', 500);
        }
        let error = undefined;
        let dbResult = undefined;


        let isRecordExists = Boolean(await db(this.tableName)
            .where(whereCondition)
            .count('* as count')
            .then(r => parseInt(r[0].count) > 0)
            .catch(console.error));
        if (!isRecordExists) {
            return result.setError(
                "Record not found",
                404
            );
        }

        if (this.signField) {
            dbResult = await db(this.tableName).where(whereCondition).update({
                [this.signField]: (this.signFieldDeletedValue === 'undefined' ? true : this.signFieldDeletedValue)
            }).catch(err => {
                error = err;
            });
        }
        else {
            dbResult = await db(this.tableName).where(whereCondition).del().catch(err => {
                error = err;
            });
        }


        if (error) {
            return result.setError(error, 500);
        }
        else {
            return result.setSuccess(null);
        }

        return result;
    }
}
