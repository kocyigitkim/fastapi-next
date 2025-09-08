import { WorkflowRouteAction } from '../WorkflowRouteAction';
import { WorkflowRouteActionResult } from '../WorkflowRouteActionResult';
import { CurrentArgsSource, WorkflowExecuteContext } from '../WorkflowExecuteContext';
import { EntityManager, EntityRelation } from '../../entities';
import { invokeDbHooks } from '../DbHookInvoker';
import { NextPlugin } from '../../plugins/NextPlugin';

interface RelationInputDefinition {
  relation: string; // relation name defined on entity
  mode?: 'insert' | 'upsert' | 'replace'; // replace deletes existing before insert
  dataPath: string; // jsonpath in args for related collection/object
  whereMergeKeys?: string[]; // for upsert match keys in child data
}

export class EntityUpsertWithRelationsAction extends WorkflowRouteAction {
  constructor(
    private entityManagerName: string,
    private entityName: string,
    private primaryDataPath: string, // jsonpath root for main entity data
    private relationInputs: RelationInputDefinition[],
    private where?: any, // if provided => update, else insert
    private dbSource?: string
  ) { super('entityUpsertWithRelations'); }

  async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    let result = new WorkflowRouteActionResult().setError('Execution error', 500);
    const args = context.getCurrentArgs(CurrentArgsSource.all);
    const em: any = context.nextContext?.[this.entityManagerName];
    if(!em) return result.setError('EntityManager not found', 500);
    const entity = em.get(this.entityName);
    if(!entity) return result.setError('Entity not found', 404);
    const db = (em as any)['dbResolver'] ? (em as any).dbResolver(this.dbSource || 'db') : context.nextContext?.[this.dbSource || 'db'];
    if(!db) return result.setError('Database source not found', 500);
    const plugin: NextPlugin<any> = context.nextContext.app?.registry?.getPlugin?.(this.dbSource || 'db');

    try {
      const mainData = context.queryParam(args, this.primaryDataPath);
      if(!mainData || typeof mainData !== 'object') return result.setError('Primary data not found',400);

      // determine primary key field
      const pkField = entity.fields.find(f=>f.primary) || entity.fields[0];
      if(!pkField) return result.setError('Primary key field not defined',500);

      const trx = await db.transaction();
      try {
        let idValue = mainData[pkField.name];
        let isUpdate = false;
        if(this.where) {
          const mappedWhere = context.map(this.where, args);
          const existing = await trx(entity.table).where(mappedWhere).first();
          if(existing) { isUpdate = true; idValue = existing[pkField.column||pkField.name]; }
        } else if(idValue) {
          const existing = await trx(entity.table).where({ [pkField.column||pkField.name]: idValue }).first();
          isUpdate = Boolean(existing);
        }

        const filteredMain: any = {};
        for(const f of entity.fields) {
          if(f.readonly) continue;
          if(mainData[f.name] !== undefined) filteredMain[f.column||f.name] = mainData[f.name];
          else if(!isUpdate && f.default !== undefined) filteredMain[f.column||f.name] = f.default;
        }

        if(isUpdate) {
          if(!(await invokeDbHooks(plugin,'before','update',{ table: entity.table, data: filteredMain, where: { [pkField.column||pkField.name]: idValue }, nextContext: context.nextContext, workflow: context, action: this }))) {
            await trx.rollback();
            return result.setError('Update cancelled by middleware',400);
          }
          await trx(entity.table).where({ [pkField.column||pkField.name]: idValue }).update(filteredMain);
          await invokeDbHooks(plugin,'after','update',{ table: entity.table, data: filteredMain, where: { [pkField.column||pkField.name]: idValue }, nextContext: context.nextContext, workflow: context, action: this });
        } else {
          if(!(await invokeDbHooks(plugin,'before','insert',{ table: entity.table, data: filteredMain, nextContext: context.nextContext, workflow: context, action: this }))) {
            await trx.rollback();
            return result.setError('Insert cancelled by middleware',400);
          }
          const inserted = await trx(entity.table).insert(filteredMain).returning(pkField.column||pkField.name);
          idValue = Array.isArray(inserted) ? inserted[0][pkField.column||pkField.name] || inserted[0] : inserted;
          await invokeDbHooks(plugin,'after','insert',{ table: entity.table, data: filteredMain, result: idValue, nextContext: context.nextContext, workflow: context, action: this });
        }

        // process relations
        for(const rInput of this.relationInputs) {
          const rel = entity.relations?.find(r=>r.name===rInput.relation);
            if(!rel) continue;
          const relData = context.queryParam(args, rInput.dataPath) || [];
          if(!Array.isArray(relData) && rel.type==='oneToMany') continue;
          if(rel.type==='oneToMany') {
            await this.handleOneToMany(trx, context, rel, relData, idValue, rInput, plugin);
          }
          // manyToMany not implemented yet placeholder
        }

        await trx.commit();
        return result.setSuccess({ id: idValue });
      } catch (err) {
        await trx.rollback();
        throw err;
      }
    } catch (e:any) {
      return result.setError(e.message,500);
    }
  }

  private async handleOneToMany(trx: any, context: WorkflowExecuteContext, rel: EntityRelation, relData: any[], parentId: any, rInput: RelationInputDefinition, plugin?: NextPlugin<any>) {
    const childEntityManager: any = context.nextContext?.[this.entityManagerName];
    const childEntity = childEntityManager.get(rel.target);
    if(!childEntity) return;
    const childPk = childEntity.fields.find(f=>f.primary) || childEntity.fields[0];
    const foreignKey = rel.foreignKey || `${this.entityName}${childPk ? 'Id':''}`;

    if(rInput.mode==='replace') {
      // delete existing children then insert all
      await trx(childEntity.table).where({ [foreignKey]: parentId }).del();
    }

    for(const item of relData) {
      item[foreignKey] = parentId;
      const pkVal = item[childPk.name];
      const exists = pkVal ? await trx(childEntity.table).where({ [childPk.column||childPk.name]: pkVal }).first() : null;
      if(exists && (rInput.mode==='upsert' || rInput.mode==='replace')) {
        const updateObj: any = {};
        for(const f of childEntity.fields) {
          if(f.readonly) continue;
          if(item[f.name] !== undefined) updateObj[f.column||f.name] = item[f.name];
        }
        if(!(await invokeDbHooks(plugin,'before','update',{ table: childEntity.table, data: updateObj, where: { [childPk.column||childPk.name]: pkVal }, nextContext: context.nextContext, workflow: context, action: this }))) {
          continue;
        }
        await trx(childEntity.table).where({ [childPk.column||childPk.name]: pkVal }).update(updateObj);
        await invokeDbHooks(plugin,'after','update',{ table: childEntity.table, data: updateObj, where: { [childPk.column||childPk.name]: pkVal }, nextContext: context.nextContext, workflow: context, action: this });
      } else {
        const insertObj: any = {};
        for(const f of childEntity.fields) {
          if(f.readonly) continue;
          if(item[f.name] !== undefined) insertObj[f.column||f.name] = item[f.name];
          else if(f.default !== undefined) insertObj[f.column||f.name] = f.default;
        }
        if(!(await invokeDbHooks(plugin,'before','insert',{ table: childEntity.table, data: insertObj, nextContext: context.nextContext, workflow: context, action: this }))) {
          continue;
        }
        await trx(childEntity.table).insert(insertObj);
        await invokeDbHooks(plugin,'after','insert',{ table: childEntity.table, data: insertObj, nextContext: context.nextContext, workflow: context, action: this });
      }
    }
  }
}
