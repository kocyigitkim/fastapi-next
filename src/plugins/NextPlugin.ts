import { NextHealthCheckStatus } from "../config/NextOptions";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";
import { NextFlag } from "../NextFlag";

export type DbOperation = 'insert' | 'update' | 'delete' | 'select' | 'procedure';
export interface DbOperationContext {
    table?: string;
    data?: any; // insert/update payload
    where?: any; // where condition
    options?: any; // extra options (pagination, ordering, params)
    result?: any; // after-operation result
    operation: DbOperation;
    nextContext: NextContextBase;
    workflow?: any; // WorkflowExecuteContext if available
    action?: any; // WorkflowRouteAction if available
    plugin?: NextPlugin<any>;
    query?: any; // underlying knex query builder (modifiable before exec)
}

export class NextPlugin<T> {
    constructor(public name: string, public showInContext: boolean = false) { }
    private _dbMiddlewares: any[] = [];
    public async init(next: NextApplication) {
    }
    public async middleware(next: NextContextBase): Promise<boolean | NextFlag> {
        return true;
    }
    public async destroy(next: NextApplication) {
    }
    public async retrieve(next: NextContextBase): Promise<T> {
        return null;
    }
    public async disposeInstance(next: NextContextBase, instance: T): Promise<void> { }
    public async healthCheck(next: NextApplication): Promise<NextHealthCheckStatus> {
        return NextHealthCheckStatus.Dead();
    }
    // Hooks: return false to cancel operation. Throw to error.
    public async onBeforeDb?(context: DbOperationContext): Promise<boolean | void>;
    public async onAfterDb?(context: DbOperationContext): Promise<void>;
    public registerDbMiddleware(mw: { name?: string; priority?: number; before?(ctx: DbOperationContext): Promise<boolean|void>|boolean|void; after?(ctx: DbOperationContext): Promise<void>|void; enabled?:(ctx:DbOperationContext)=>boolean; }) {
        this._dbMiddlewares.push(mw);
        this._dbMiddlewares.sort((a,b)=>(a.priority||0)-(b.priority||0));
    }
    public getDbMiddlewares(){ return this._dbMiddlewares; }
}