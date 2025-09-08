import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";
import { invokeDbHooks } from '../DbHookInvoker';
import { NextPlugin } from '../../plugins/NextPlugin';


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
    const plugin: NextPlugin<any> = context.nextContext.app?.registry?.getPlugin?.(this.dbSource);

        if (!db) {
            return result.setError('Database source not found', 500);
        }
        let error = undefined;
        if(!(await invokeDbHooks(plugin,'before','insert',{ table: this.tableName, data: mappedArgs, nextContext: context.nextContext, workflow: context, action: this }))) {
            return result.setError('Insert cancelled by middleware', 400);
        }
        let dbResult = await db(this.tableName).insert(mappedArgs).returning(this.returns || '*').catch(err => {
            error = err;
        });

        if(!error) {
            await invokeDbHooks(plugin,'after','insert',{ table: this.tableName, data: mappedArgs, result: dbResult, nextContext: context.nextContext, workflow: context, action: this });
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
