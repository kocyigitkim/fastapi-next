import { WorkflowRouteAction } from '../WorkflowRouteAction';
import { WorkflowRouteActionResult } from '../WorkflowRouteActionResult';
import { CurrentArgsSource, WorkflowExecuteContext } from '../WorkflowExecuteContext';
import { EntityManager } from '../../entities';
import { invokeDbHooks } from '../DbHookInvoker';
import { NextPlugin } from '../../plugins/NextPlugin';

export class EntityUpdateAction extends WorkflowRouteAction {
  constructor(private entityManagerName: string, private entityName: string, private where: any, private inputArgs: any, private dbSource?: string) {
    super('entityUpdate');
  }

  async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    let result = new WorkflowRouteActionResult().setError('Execution error', 500);
    const args = context.getCurrentArgs(CurrentArgsSource.all);
    const em: EntityManager = context.nextContext?.[this.entityManagerName];
    if(!em) return result.setError('EntityManager not found', 500);
    try {
      const entity = em.get(this.entityName);
      if(!entity) return result.setError('Entity not found', 404);
      const db = (em as any)['dbResolver'] ? (em as any).dbResolver(this.dbSource || 'db') : context.nextContext?.[this.dbSource || 'db'];
      if(!db) return result.setError('Database source not found', 500);
      const mapped = context.map(this.inputArgs, args);
      const mappedWhere = context.map(this.where, args);
      const updateObj: any = {};
      for(const f of entity.fields){
        if(f.readonly) continue;
        if(mapped[f.name] !== undefined) updateObj[f.column || f.name] = mapped[f.name];
      }
      if(Object.keys(updateObj).length === 0) return result.setSuccess(null);
      const exists = await db(entity.table).where(mappedWhere).first();
      if(!exists) return result.setError('Record not found', 404);
      const plugin: NextPlugin<any> = context.nextContext.app?.registry?.getPlugin?.(this.dbSource || 'db');
      if(!(await invokeDbHooks(plugin,'before','update',{ table: entity.table, data: updateObj, where: mappedWhere, nextContext: context.nextContext, workflow: context, action: this }))) {
        return result.setError('Update cancelled by middleware', 400);
      }
      await db(entity.table).where(mappedWhere).update(updateObj);
      await invokeDbHooks(plugin,'after','update',{ table: entity.table, data: updateObj, where: mappedWhere, nextContext: context.nextContext, workflow: context, action: this });
      return result.setSuccess(null);
    } catch (e:any) {
      return result.setError(e.message, 500);
    }
  }
}
