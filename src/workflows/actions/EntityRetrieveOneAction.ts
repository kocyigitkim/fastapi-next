import { WorkflowRouteAction } from '../WorkflowRouteAction';
import { WorkflowRouteActionResult } from '../WorkflowRouteActionResult';
import { CurrentArgsSource, WorkflowExecuteContext } from '../WorkflowExecuteContext';
import { EntityManager } from '../../entities';
import { invokeDbHooks } from '../DbHookInvoker';
import { NextPlugin } from '../../plugins/NextPlugin';

export class EntityRetrieveOneAction extends WorkflowRouteAction {
  constructor(private entityManagerName: string, private entityName: string, private where: any, private view?: string, private dbSource?: string) {
    super('entityRetrieveOne');
  }

  async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    let result = new WorkflowRouteActionResult().setError('Execution error', 500);
    const args = context.getCurrentArgs(CurrentArgsSource.all);
    const em: EntityManager = context.nextContext?.[this.entityManagerName];
    if(!em) return result.setError('EntityManager not found', 500);
    try {
      const { query, runtime } = em.buildRetrieveOne(this.entityName, this.where, { view: this.view, dbSource: this.dbSource, args, contextMap: (o,src)=> context.map(o, src) });
      const plugin: NextPlugin<any> = context.nextContext.app?.registry?.getPlugin?.(this.dbSource || 'db');
  if(!(await invokeDbHooks(plugin,'before','select',{ table: runtime.entity.table, where: this.where, options: { view: runtime.view?.name }, query, nextContext: context.nextContext, workflow: context, action: this }))) {
        return result.setError('Select cancelled by middleware', 400);
      }
      const data = await query;
  await invokeDbHooks(plugin,'after','select',{ table: runtime.entity.table, where: this.where, result: data, options: { view: runtime.view?.name }, query, nextContext: context.nextContext, workflow: context, action: this });
      return result.setSuccess(data);
    } catch (e:any) {
      return result.setError(e.message, 500);
    }
  }
}
