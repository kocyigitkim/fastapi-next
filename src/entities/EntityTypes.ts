import { EntityFieldType } from './EntityFieldType';

export interface EntityField {
  name: string;
  column?: string; // db column if different
  type: EntityFieldType | string;
  nullable?: boolean;
  primary?: boolean;
  readonly?: boolean;
  default?: any;
  description?: string;
  // relation meta reserved (future)
}

export interface EntityViewDefinition {
  name: string;
  description?: string;
  // projection list (field names). If not set, default to entity defaultFields or all
  select?: string[];
  // base where object (templated). Will be mapped via workflow context.map
  where?: any;
  // default ordering; can be overridden by $orderby
  orderBy?: { field: string; direction?: 'asc' | 'desc' }[];
  // default pagination size; can be overridden
  pageSize?: number;
  // searchable fields list for $search
  search?: string[];
  // additional custom builder hook (receives knex query and params)
  extend?: (q: any, params: ParsedViewParams, runtime: BuildRuntimeContext) => any;
}

export interface EntitySchema {
  name: string; // logical name
  table: string; // db table
  description?: string;
  fields: EntityField[];
  defaultView?: string; // name of default view
  views?: EntityViewDefinition[];
  // default fields when no $select
  defaultFields?: string[];
  relations?: EntityRelation[];
}

export interface ParsedViewParams {
  select?: string[];
  filter?: any; // dynamic filter body (JSON or expression) - delegated to knext.filter if object
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  top?: number;
  skip?: number;
  search?: string;
}

export interface BuildRuntimeContext {
  entity: EntitySchema;
  view?: EntityViewDefinition;
  db: any;
  args: any;
  contextMap: (obj: any, src: any) => any;
}

export type EntityRelationType = 'oneToMany' | 'manyToOne' | 'manyToMany';
export interface EntityRelation {
  name: string; // logical relation name
  type: EntityRelationType;
  target: string; // target entity name
  // key mapping
  foreignKey?: string; // for oneToMany: child's column referencing parent localKey
  localKey?: string; // parent key (default primary key field)
  // many-to-many join info
  joinTable?: string;
  joinSourceKey?: string; // column in join table referencing parent
  joinTargetKey?: string; // column referencing target
  cascade?: { insert?: boolean; update?: boolean; delete?: boolean };
  description?: string;
}
