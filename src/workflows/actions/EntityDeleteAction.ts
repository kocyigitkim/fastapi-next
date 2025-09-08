import { WorkflowRouteAction } from '../WorkflowRouteAction';
import { WorkflowRouteActionResult } from '../WorkflowRouteActionResult';
import { CurrentArgsSource, WorkflowExecuteContext } from '../WorkflowExecuteContext';
import { EntityManager } from '../../entities';
import { invokeDbHooks } from '../DbHookInvoker';
import { NextPlugin } from '../../plugins/NextPlugin';

export class EntityDeleteAction extends WorkflowRouteAction {
  constructor(private entityManagerName: string, private entityName: string, private where: any, private dbSource?: string, private softDeleteField?: string) {
    super('entityDelete');
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
      const mappedWhere = context.map(this.where, args);
      const exists = await db(entity.table).where(mappedWhere).first();
      if(!exists) return result.setError('Record not found', 404);
      const plugin: NextPlugin<any> = context.nextContext.app?.registry?.getPlugin?.(this.dbSource || 'db');
      if(!(await invokeDbHooks(plugin,'before','delete',{ table: entity.table, where: mappedWhere, nextContext: context.nextContext, workflow: context, action: this }))) {
        return result.setError('Delete cancelled by middleware',400);
      }
      if(this.softDeleteField){
        await db(entity.table).where(mappedWhere).update({ [this.softDeleteField]: true });
      } else {
        await db(entity.table).where(mappedWhere).del();
      }
      await invokeDbHooks(plugin,'after','delete',{ table: entity.table, where: mappedWhere, nextContext: context.nextContext, workflow: context, action: this });
      return result.setSuccess(null);
    } catch (e:any) {
      return result.setError(e.message, 500);
    }
  }
}
