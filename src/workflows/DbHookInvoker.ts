import { NextContextBase } from '../NextContext';
import { NextPlugin, DbOperation, DbOperationContext } from '../plugins/NextPlugin';
import { WorkflowExecuteContext } from './WorkflowExecuteContext';
import { WorkflowRouteAction } from './WorkflowRouteAction';

export async function invokeDbHooks(
  plugin: NextPlugin<any> | undefined,
  phase: 'before' | 'after',
  op: DbOperation,
  ctx: Partial<DbOperationContext>
): Promise<boolean> {
  if(!plugin) return true;
  const context: DbOperationContext = { operation: op, plugin, ...ctx } as any;
  if(phase === 'before') {
    if(plugin.onBeforeDb) {
      const r = await plugin.onBeforeDb(context);
      if(r === false) return false;
    }
    const mws = (plugin as any).getDbMiddlewares?.() || [];
    for(const mw of mws) {
      if(mw.enabled && mw.enabled(context) === false) continue;
      if(mw.before) {
        const r = await mw.before(context);
        if(r === false) return false;
      }
    }
  }
  if(phase === 'after') {
    if(plugin.onAfterDb) await plugin.onAfterDb(context);
    const mws = (plugin as any).getDbMiddlewares?.() || [];
    for(const mw of mws) {
      if(mw.enabled && mw.enabled(context) === false) continue;
      if(mw.after) await mw.after(context);
    }
  }
  return true;
}
