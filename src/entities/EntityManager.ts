import { knext } from 'knex-next';
import { EntitySchema, ParsedViewParams, BuildRuntimeContext, EntityViewDefinition } from './EntityTypes';

export class EntityManager {
  private entities = new Map<string, EntitySchema>();
  constructor(private dbResolver?: (name: string) => any) {}

  register(entity: EntitySchema) {
    this.entities.set(entity.name.toLowerCase(), entity);
  }

  get(name: string): EntitySchema | undefined {
    return this.entities.get(name.toLowerCase());
  }

  list(): EntitySchema[] { return [...this.entities.values()]; }

  parseParams(raw: any): ParsedViewParams {
    if(!raw) return {};
    const p: ParsedViewParams = {};
    if(raw.$select) p.select = raw.$select.split(',').map((s: string)=>s.trim()).filter(Boolean);
    if(raw.$search) p.search = String(raw.$search);
    if(raw.$top) p.top = parseInt(raw.$top);
    if(raw.$skip) p.skip = parseInt(raw.$skip);
    if(raw.$filter) {
      // Accept JSON object or simple string (delegated to knext.filter which already handles object expression style)
      try { p.filter = typeof raw.$filter === 'string' && raw.$filter.trim().startsWith('{') ? JSON.parse(raw.$filter) : raw.$filter; } catch { p.filter = raw.$filter; }
    }
    if(raw.$orderby) {
      p.orderBy = raw.$orderby.split(',').map((s: string)=>{ const [f, d] = s.trim().split(/\s+/); return { field: f, direction: (d?.toLowerCase()==='desc'?'desc':'asc') as 'asc'|'desc'}; });
    }
    return p;
  }

  private resolveView(entity: EntitySchema, viewName?: string): EntityViewDefinition | undefined {
    if(!viewName) viewName = entity.defaultView;
    if(!viewName) return undefined;
    return entity.views?.find(v=>v.name===viewName);
  }

  buildRetrieveMany(entityName: string, options: { view?: string; params?: ParsedViewParams; dbSource?: string; args?: any; contextMap?: (obj:any,src:any)=>any }): { query: any; runtime: BuildRuntimeContext } {
    const entity = this.get(entityName);
    if(!entity) throw new Error(`Entity '${entityName}' not found`);
    const view = this.resolveView(entity, options.view);
    const db = this.resolveDb(options.dbSource);
    const args = options.args || {};
    const runtime: BuildRuntimeContext = { entity, view, db, args, contextMap: options.contextMap || ((o)=>o) };
    let q = db(entity.table);
    const kn = knext(q);
    const vp = options.params || {};

    // where
    if(view?.where) {
      const mapped = runtime.contextMap(view.where, args);
      q = q.where(mapped);
    }
    if(vp.filter) {
      // Pass filter object to knext if object else attempt raw usage
      let k = kn.filter(vp.filter);
      q = (k as any).query || q; // knext returns wrapper; we continue using wrapper chain
    }

    // projection
    let select = vp.select || view?.select || entity.defaultFields || entity.fields.map(f=>f.name);
    q = q.select(select.map(f=> this.fieldColumn(entity, f) + ' as ' + f));

    // search
    if(vp.search && (view?.search?.length || 0) > 0) {
      kn.search(vp.search, ...(view!.search!));
    }

    // order
    const order = vp.orderBy || view?.orderBy;
    if(order) order.forEach(o=> { q = q.orderBy(this.fieldColumn(entity, o.field), o.direction || 'asc'); });

    // pagination
    if(typeof vp.skip === 'number') q = q.offset(vp.skip);
    const take = vp.top || view?.pageSize;
    if(typeof take === 'number') q = q.limit(take);

    if(view?.extend) {
      const wrapper = knext(q);
      const extended = view.extend(wrapper, vp, runtime) || wrapper;
      q = (extended as any).query || q;
    }

    return { query: q, runtime };
  }

  buildRetrieveOne(entityName: string, where: any, options: { view?: string; dbSource?: string; args?: any; contextMap?: (obj:any,src:any)=>any }): { query: any; runtime: BuildRuntimeContext } {
    const entity = this.get(entityName);
    if(!entity) throw new Error(`Entity '${entityName}' not found`);
    const view = this.resolveView(entity, options.view);
    const db = this.resolveDb(options.dbSource);
    const args = options.args || {};
    const runtime: BuildRuntimeContext = { entity, view, db, args, contextMap: options.contextMap || ((o)=>o) };
    let q = db(entity.table);
    const mappedWhere = runtime.contextMap(where, args);
    q = q.where(mappedWhere);
    let select = view?.select || entity.defaultFields || entity.fields.map(f=>f.name);
    q = q.select(select.map(f=> this.fieldColumn(entity, f) + ' as ' + f));
    return { query: q.first(), runtime };
  }

  private fieldColumn(entity: EntitySchema, fieldName: string): string {
    const f = entity.fields.find(ff=>ff.name===fieldName);
    if(!f) throw new Error(`Field '${fieldName}' not found on entity '${entity.name}'`);
    return f.column || f.name;
  }

  private resolveDb(name?: string) {
    if(!this.dbResolver) throw new Error('EntityManager dbResolver not configured');
    return this.dbResolver(name || 'db');
  }
}
