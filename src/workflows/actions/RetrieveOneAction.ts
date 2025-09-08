import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";
import { invokeDbHooks } from '../DbHookInvoker';
import { NextPlugin } from '../../plugins/NextPlugin';


export class RetrieveOneAction extends WorkflowRouteAction {
    constructor(
        private dbSource: string,
        private tableName: string,
        private where: any,
        private projection?: string[],
        private customWhere?: (context: WorkflowExecuteContext, query: any, args?: any) => any | Promise<any>
    ) {
        super("retrieveOne");
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );
        const args = context.getCurrentArgs(CurrentArgsSource.all);

    const db = context.nextContext?.[this.dbSource];
    const plugin: NextPlugin<any> = context.nextContext.app?.registry?.getPlugin?.(this.dbSource);

        if (!db) {
            return result.setError('Database source not found', 500);
        }
        let dbQuery: any = db(this.tableName);

        let whereCondition = context.map(this.where, args);
        if (whereCondition) {
            dbQuery = dbQuery.where(whereCondition);
        }
        if (this.customWhere) {
            const maybeQuery = await this.customWhere(context, dbQuery, args);
            const resolved = (maybeQuery && (maybeQuery.query && typeof maybeQuery.query.orderBy === 'function') ? maybeQuery.query : maybeQuery);
            if (resolved && typeof resolved.orderBy === 'function' && typeof resolved.where === 'function') {
                dbQuery = resolved;
            }
        }
        if (this.projection?.length > 0) {
            dbQuery = dbQuery.select(this.projection);
        }
        let error = undefined;
        if(!(await invokeDbHooks(plugin,'before','select',{ table: this.tableName, where: whereCondition, query: dbQuery, nextContext: context.nextContext, workflow: context, action: this }))) {
            return result.setError('Select cancelled by middleware', 400);
        }
        let dbResult = await dbQuery.first().catch(err => {
            error = err;
        });
        if(!error) {
            await invokeDbHooks(plugin,'after','select',{ table: this.tableName, where: whereCondition, result: dbResult, query: dbQuery, nextContext: context.nextContext, workflow: context, action: this });
        }
        
        if (error) {
            return result.setError(error, 500);
        }
        else {
            return result.setSuccess(dbResult);
        }

        return result;
    }
}
