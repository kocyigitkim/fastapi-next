import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";
import { invokeDbHooks } from '../DbHookInvoker';
import { NextPlugin } from '../../plugins/NextPlugin';


export class UpdateAction extends WorkflowRouteAction {
    constructor(private dbSource: string, private tableName: string, private args: any, private where: any, private returns?: string[]) {
        super("create");
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );
        const args = context.getCurrentArgs(CurrentArgsSource.all);
        const mappedArgs = context.map(this.args, args);
        const whereCondition = context.map(this.where, args);
    const db = context.nextContext?.[this.dbSource];
    const plugin: NextPlugin<any> = context.nextContext.app?.registry?.getPlugin?.(this.dbSource);

        if (!db) {
            return result.setError('Database source not found', 500);
        }
        let error = undefined;

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

        if(!(await invokeDbHooks(plugin,'before','update',{ table: this.tableName, data: mappedArgs, where: whereCondition, nextContext: context.nextContext, workflow: context, action: this }))) {
            return result.setError('Update cancelled by middleware', 400);
        }
        let dbResult = await db(this.tableName).where(whereCondition).update(mappedArgs).catch(err => {
            error = err;
        });

        if(!error) {
            await invokeDbHooks(plugin,'after','update',{ table: this.tableName, data: mappedArgs, where: whereCondition, result: dbResult, nextContext: context.nextContext, workflow: context, action: this });
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
