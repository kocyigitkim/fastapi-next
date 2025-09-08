import { WorkflowRouteAction } from '../WorkflowRouteAction';
import { WorkflowRouteActionResult } from '../WorkflowRouteActionResult';
import { CurrentArgsSource, WorkflowExecuteContext } from '../WorkflowExecuteContext';
import { EntityManager } from '../../entities';
import { invokeDbHooks } from '../DbHookInvoker';
import { NextPlugin } from '../../plugins/NextPlugin';

export class EntityCreateAction extends WorkflowRouteAction {
  constructor(private entityManagerName: string, private entityName: string, private inputArgs: any, private dbSource?: string, private returning?: string[]) {
    super('entityCreate');
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
      const insertObj: any = {};
      for(const f of entity.fields){
        if(f.readonly) continue;
        if(mapped[f.name] !== undefined) insertObj[f.column || f.name] = mapped[f.name];
        else if(f.default !== undefined) insertObj[f.column || f.name] = f.default;
      }
      const plugin: NextPlugin<any> = context.nextContext.app?.registry?.getPlugin?.(this.dbSource || 'db');
      if(!(await invokeDbHooks(plugin,'before','insert',{ table: entity.table, data: insertObj, nextContext: context.nextContext, workflow: context, action: this }))) {
        return result.setError('Insert cancelled by middleware',400);
      }
      let q = db(entity.table).insert(insertObj).returning(this.returning || '*');
      const data = await q;
      await invokeDbHooks(plugin,'after','insert',{ table: entity.table, data: insertObj, result: data, nextContext: context.nextContext, workflow: context, action: this });
      return result.setSuccess(data);
    } catch (e:any) {
      return result.setError(e.message, 500);
    }
  }
}
