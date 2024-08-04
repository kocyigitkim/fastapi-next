import { WorkflowRouteActionResult } from "./WorkflowRouteActionResult";
import { WorkflowRoute } from "./WorkflowRoute";
import { WorkflowRouteAction } from "./WorkflowRouteAction";
import { NextContextBase } from "..";
import jsonpath from 'jsonpath';

export enum CurrentArgsSource {
    //'body' | 'params' | 'all' | 'headers' | 'lastActionResult'
    body = 'body',
    params = 'params',
    all = 'all',
    headers = 'headers',
    lastActionResult = 'lastActionResult'
}

export class WorkflowExecuteContext {
    public parameters: any = {};
    public actionResults: any = [];
    public errors: any = [];
    public status?: number;
    constructor(public workflow: WorkflowRoute, public nextContext: NextContextBase) {
    }

    get(name: string) {
        return this.parameters[name];
    }
    has(name: string) {
        return Boolean(this.parameters[name]);
    }
    set(name: string, value: any) {
        this.parameters[name] = value;
    }
    setActionResult(action: WorkflowRouteAction, result: WorkflowRouteActionResult) {
        this.actionResults.push({
            action: action,
            result: result
        });
    }
    getActionResult(action: WorkflowRouteAction) {
        return this.actionResults.find(r => r.action === action);
    }
    getActionResultByName(name: string) {
        return this.actionResults.find(r => r.action.name === name);
    }
    setError(error: any) {
        this.errors.push(error);
    }
    hasError() {
        return Boolean(this.errors.length > 0);
    }
    getCurrentArgs(src: CurrentArgsSource) {
        let args = {};
        switch (src) {
            case CurrentArgsSource.body:
                args = this.nextContext.body;
                break;
            case CurrentArgsSource.params:
                args = this.nextContext.params;
                break;
            case CurrentArgsSource.headers:
                args = this.nextContext.headers;
                break;
            case CurrentArgsSource.lastActionResult:
                args = this.actionResults?.[this.actionResults?.length - 1]?.result?.result;
                break;
            case CurrentArgsSource.all:
                args = {
                    ...this.nextContext.all,
                    body: this.nextContext.body,
                    params: this.nextContext.params,
                    headers: this.nextContext.headers,
                    session: this.nextContext.session,
                    context: this.nextContext,
                    ...this.actionResults?.[this.actionResults?.length - 1]?.result?.result
                };
                break;
            default:
                break;
        }
        return args;
    }
    queryParam(obj: any, paramName: string) {
        if (paramName.startsWith("$")) {
            return jsonpath.value(obj, paramName);
        }
        else {
            return obj?.[paramName];
        }
    }
    map(mapping: any, args: any) {
        if (Array.isArray(mapping)) {
            return mapping.map(m => this.map(m, args));
        }
        else if (typeof mapping === 'object') {
            let mapped = {};
            for (const key in mapping) {
                if (Object.prototype.hasOwnProperty.call(mapping, key)) {
                    const element = mapping[key];
                    let v = this.map(element, args);
                    if (v !== undefined) {
                        mapped[key] = v;
                    }
                }
            }
            return mapped;
        }
        else if (typeof mapping === 'string') {
            return this.queryParam(args, mapping);
        }
        else {
            return mapping;
        }
    }
}
