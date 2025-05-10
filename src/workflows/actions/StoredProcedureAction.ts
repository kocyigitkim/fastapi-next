import { NextContextBase } from "../../NextContext";
import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

export class StoredProcedureAction extends WorkflowRouteAction {
    constructor(private dbSource: string, private spName: string, private spArgs: any, private passFirstArg?: any) {
        super("storedprocedure");
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );
        const args = context.getCurrentArgs(CurrentArgsSource.all);
        let mappedArgs = context.map(this.spArgs, args);
        const db = context.nextContext?.[this.dbSource];

        if (this.passFirstArg !== undefined) {
            mappedArgs = [this.passFirstArg, ...mappedArgs];
        }

        if (!db) {
            return result.setError('Database source not found', 500);
        }

        mappedArgs = mappedArgs.map(r => {
            if(r === undefined) return null;
            return r;
        });

        const dbClient = db.client.config.client;
        switch (dbClient) {
            case 'mssql':
                {
                    let q = `exec ${this.spName} ${mappedArgs.map(r => '?').join(', ')}`;
                    let err = undefined;
                    let r = await db.raw(q, mappedArgs).catch(e => {
                        err = e;
                        return undefined;
                    });
                    if (err) {
                        return result.setError(err.message, 500);
                    } else {
                        result = new WorkflowRouteActionResult().setSuccess(r);
                    }
                }
                break;
            case 'pg':
                {
                    let q = `CALL ${this.spName}(${mappedArgs.map((r, i) => "?").join(', ')})`;
                    let err = undefined;
                    let r: any = await db.raw(q, mappedArgs).then(r => r?.rows || []).catch(e => {
                        err = e;
                        return undefined;
                    });
                    if (!err) {
                        if (Array.isArray(r) && r.length === 1 && Object.keys(r[0]).length === 1 && typeof r[0] === "object") {
                            r = Object.values(r[0])[0];
                        }
                    }
                    if (err) {
                        return result.setError(err.message?.toString()?.replace(/CALL\s+\w+\s*\((.*?)\)\s*-\s*/, ""), 500);
                    } else {
                        result = new WorkflowRouteActionResult().setSuccess(r);
                    }
                }
                break;
            case 'mysql':
            case 'mysql2':
                {
                    let q = `CALL ${this.spName}(${mappedArgs.map(r => '?').join(', ')})`;
                    let err = undefined;
                    let r = await db.raw(q, mappedArgs).catch(e => {
                        err = e;
                        return undefined;
                    });
                    if (err) {
                        return result.setError(err.message, 500);
                    } else {
                        result = new WorkflowRouteActionResult().setSuccess(r);
                    }
                }
                break;
            case 'oracledb':
                {
                    let q = `BEGIN ${this.spName}(${mappedArgs.map((r, i) => `:p${i + 1}`).join(', ')}); END;`;
                    let err = undefined;
                    let r = await db.raw(q, mappedArgs).catch(e => {
                        err = e;
                        return undefined;
                    });
                    if (err) {
                        return result.setError(err.message, 500);
                    } else {
                        result = new WorkflowRouteActionResult().setSuccess(r);
                    }
                }
                break;
            case 'sqlite3':
                {
                    let q = `CALL ${this.spName}(${mappedArgs.map(r => '?').join(', ')})`;
                    let err = undefined;
                    let r = await db.raw(q, mappedArgs).catch(e => {
                        err = e;
                        return undefined;
                    });
                    if (err) {
                        return result.setError(err.message, 500);
                    } else {
                        result = new WorkflowRouteActionResult().setSuccess(r);
                    }
                }
                break;
            default:
                return result.setError(`Unsupported database client: ${dbClient}`, 500);
        }

        return result;
    }
}
