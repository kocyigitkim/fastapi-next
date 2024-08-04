import { ObjectSchema } from "yup";
import { NextContextBase, NextFlag } from "..";
import { AuthorizeAction } from "./actions/AuthorizeAction";
import { CreateAction } from "./actions/CreateAction";
import { DeleteAction } from "./actions/DeleteAction";
import { MapAction } from "./actions/MapAction";
import { RetrieveManyAction } from "./actions/RetrieveManyAction";
import { RetrieveOneAction } from "./actions/RetrieveOneAction";
import { StoredProcedureAction } from "./actions/StoredProcedureAction";
import { UpdateAction } from "./actions/UpdateAction";
import { CurrentArgsSource, WorkflowExecuteContext } from "./WorkflowExecuteContext";
import { WorkflowExecutionResult } from "./WorkflowExecutionResult";
import { WorkflowRouteAction } from "./WorkflowRouteAction";
import { WorkflowRouteActionResult } from "./WorkflowRouteActionResult";
import { WorkflowRouter } from "./WorkflowRouter";
import { ValidateAction } from "./actions/ValidateAction";
import * as yup from 'yup';
const DEFAULT_DB_PLUGIN_NAME = "db";

type WorkflowHttpMethod = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
type ValidatePresetType = 'list';
type ValidatePresetOptions = {
    list?: {
        maxPageSize?: number
        minPageSize?: number
        paginationRequired?: boolean
    }
};

export class WorkflowRoute {
    actions: WorkflowRouteAction[];
    httpMethod: string[] = [];
    public description: string;
    public summary: string;
    public tags: string;
    public isDeprecated?: boolean;
    constructor(public router: WorkflowRouter, public path: string) {
        this.actions = [];
    }

    desc(description: string) {
        this.description = description;
        return this;
    }

    sum(summary: string) {
        this.summary = summary;
        return this;
    }

    tag(tags: string) {
        this.tags = tags;
        return this;
    }

    deprecated() {
        this.isDeprecated = true;
        return this;
    }

    method(method: WorkflowHttpMethod) {
        this.httpMethod.push(method);
        return this;
    }
    methods(...methods: WorkflowHttpMethod[]) {
        this.httpMethod = this.httpMethod.concat([...methods]);
        return this;
    }

    action(a: WorkflowRouteAction) {
        this.actions.push(a);
        return this;
    }

    authorize(options?: {
        anonymous?: boolean,
        custom?: Function
    }) {
        this.actions.push(new AuthorizeAction(options?.anonymous, options?.custom));
        return this;
    }

    anonymous() {
        return this.authorize({ anonymous: true });
    }

    storedProcedure(options: {
        db?: string,
        name: string,
        args?: any,
        firstArg?: any
    }) {
        return this.action(new StoredProcedureAction(options.db || DEFAULT_DB_PLUGIN_NAME, options.name, options.args, options.firstArg));
    }

    map(options: {
        source: CurrentArgsSource,
        map: any
    }) {
        return this.action(new MapAction(options.source, options.map));
    }

    create(options: {
        db?: string,
        table: string,
        args: any,
        returns?: any
    }) {
        return this.action(new CreateAction(
            options.db || DEFAULT_DB_PLUGIN_NAME,
            options.table,
            options.args,
            options.returns
        ));
    }

    update(options: {
        db?: string,
        table: string,
        where: any,
        args: any,
        returns?: any
    }) {
        return this.action(new UpdateAction(
            options.db || DEFAULT_DB_PLUGIN_NAME,
            options.table,
            options.args,
            options.where,
            options.returns
        ));
    }

    delete(options: {
        db?: string,
        table: string,
        where: any,
        returns?: any,
        field?: string,
        deletedValue?: any
    }) {
        return this.action(new DeleteAction(
            options.db || DEFAULT_DB_PLUGIN_NAME,
            options.table,
            options.where,
            options.returns,
            options.field,
            options.deletedValue
        ));
    }

    retrieveOne(options: {
        db?: string,
        table: string,
        where: any,
        projection?: string[]
    }) {
        return this.action(new RetrieveOneAction(
            options.db || DEFAULT_DB_PLUGIN_NAME,
            options.table,
            options.where,
            options.projection
        ));
    }

    retrieveMany(options: {
        db?: string,
        table: string,
        projection?: string[],
        searchColumns?: string[],
        searchField?: string,
        filterField?: string,
        sortByField?: string,
        sortDirField?: string,
        pageIndexField?: string,
        pageSizeField?: string,
        where?: any
    }) {
        return this.action(new RetrieveManyAction(
            options.db || DEFAULT_DB_PLUGIN_NAME,
            options.table,
            options.projection,
            options.searchColumns,
            options.searchField,
            options.filterField,
            options.sortByField,
            options.sortDirField,
            options.pageIndexField,
            options.pageSizeField,
            options.where
        ));
    }

    validate(schema: ObjectSchema<any>) {
        return this.action(new ValidateAction(schema));
    }

    validatePreset(preset: ValidatePresetType, presetOptions?: ValidatePresetOptions) {
        switch (preset) {
            case 'list':
                {
                    let paginationSchema = yup.object({
                        page: yup.number().integer().min(1).default(1).optional(),
                        pageSize: yup.number().integer()
                            .min(presetOptions?.list?.minPageSize || 1)
                            .max(presetOptions?.list?.maxPageSize || 1000)
                            .optional()
                    });

                    if (presetOptions?.list?.paginationRequired) {
                        paginationSchema = paginationSchema.required();
                    }
                    else {
                        paginationSchema = paginationSchema.optional();
                    }

                    let filterSchema = yup.object({
                    }).optional();

                    let sortSchema = yup.object({
                        column: yup.string().optional(),
                        direction: yup.string().optional()
                    }).optional();

                    this.validate(yup.object({
                        pagination: paginationSchema,
                        filter: filterSchema,
                        sort: sortSchema,
                        search: yup.string().optional()
                    }));
                }
                break;
        }
        return this;
    }

    public getPath() {
        return [this.router.getPath(), this.path].join("/");
    }

    public async execute(nextContext: NextContextBase) {
        let context = new WorkflowExecuteContext(this, nextContext);
        for (let action of this.actions) {
            if (action.definitionOnly) continue;

            let actionResult: WorkflowRouteActionResult = await action.execute(context).then(r => {
                return r as any;
            }).catch((err) => {
                return {
                    success: false,
                    result: null,
                    error: err.message,
                    status: 500
                };
            });
            if (actionResult.error && !actionResult.success) {
                context.setError(actionResult.error);
            }
            context.setActionResult(action, actionResult as WorkflowRouteActionResult);

            if (actionResult?.flag === NextFlag.Exit) {
                break;
            }
        }

        let result = new WorkflowExecutionResult();
        result.context = context;
        result.error = context.hasError() ? context.errors.map(err => {
            return err.toString();
        }) : undefined;
        result.success = !context.hasError();
        let lastResult = context.actionResults?.[context.actionResults.length - 1]?.result;
        result.status = context?.status || lastResult?.status || (result.success ? 200 : 500);
        // result.result = lastResult?.result;
        result = Object.assign(result, lastResult);
        return result;
    }
}
