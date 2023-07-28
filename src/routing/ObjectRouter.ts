import { knext } from "knex-next";
import * as yup from 'yup';
import { NextContext } from "../NextContext";
import { ApiResponse } from "../ApiResponse";
import { NextApplication } from "../NextApplication";
import { NextRouteAction } from "./NextRouteAction";

export type ObjectRouterListPipeline = {
    before?: Function,
    after?: Function,
    method?: string,
    custom?: Function,
    enabled?: boolean,
    collection?: string,
    search?: {
        fields: string[]
    },
    customWhere?: Function,
    projection?: string[],
    exclude?: string[]
};

export type ObjectRouterDetailPipeline = {
    before?: Function,
    after?: Function,
    method?: string,
    custom?: Function,
    enabled?: boolean,
    collection?: string,
    whereFields?: string | {
        [key: string]: string
    },
    customWhere?: Function,
    projection?: string[],
    exclude?: string[]
}

export type ObjectRouterCreatePipeline = {
    before?: Function,
    after?: Function,
    method?: string,
    custom?: Function,
    enabled?: boolean,
    collection?: string,
    fields?: ({
        name: string,
        default?: any,
        value?: Function,
    } | string)[],
    validation?: yup.AnySchema
}

export type ObjectRouterUpdatePipeline = {
    before?: Function,
    after?: Function,
    method?: string,
    custom?: Function,
    enabled?: boolean,
    customWhere?: Function,
    collection?: string,
    whereFields?: string | {
        [key: string]: string
    },
    fields?: ({
        name: string,
        default?: any,
        value?: Function,
    } | string)[],
    validation?: yup.AnySchema
}

export type ObjectRouterDeletePipeline = {
    before?: Function,
    after?: Function,
    method?: string,
    custom?: Function,
    enabled?: boolean,
    deletedField?: string,
    deletedValue?: any,
    customWhere?: Function,
    collection?: string,
    whereFields?: string | {
        [key: string]: string
    }
}

export type ObjectRouterCustomPipeline = {
    name: string,
    before?: Function,
    after?: Function,
    method?: string,
    action?: Function,
    validation?: yup.AnySchema,
    mode?: 'list' | 'detail' | 'default',
    list?: ObjectRouterListPipeline,
    detail?: ObjectRouterDetailPipeline
}

export class ObjectRouter {
    functions = [];
    public define(options: {
        path: string,
        collection?: string,
        db?: string,
        pipeline?: {
            list?: ObjectRouterListPipeline,
            detail?: ObjectRouterDetailPipeline,
            create?: ObjectRouterCreatePipeline,
            update?: ObjectRouterUpdatePipeline,
            delete?: ObjectRouterDeletePipeline,
            custom?: ObjectRouterCustomPipeline[]
        }
    }) {
        if (options.pipeline) {
            if (options.pipeline.list) {
                this.functions.push({
                    path: options.path + "/list",
                    method: options.pipeline.list.method || "post",
                    fun: async function (ctx: NextContext<any>) {
                        let rawQuery = (ctx as any)[options.db || 'db'](options.pipeline.list.collection || options.collection);

                        if (options.pipeline.list.customWhere) {
                            rawQuery = options.pipeline.list.customWhere(ctx, rawQuery);
                        }

                        if (options.pipeline.list.before) {
                            rawQuery = options.pipeline.list.before(ctx, rawQuery);
                        }

                        if (options.pipeline.list.projection) {
                            rawQuery = rawQuery.select(...options.pipeline.list.projection);
                        }

                        let query = knext(rawQuery);
                        query = query.build(ctx.all);

                        if (options.pipeline.list.search) {
                            query = query.search(ctx.all.search, ...options.pipeline.list.search.fields);
                        }

                        let results = await query.retrieve();
                        if (results && results.data) {
                            results.data = results.data.map((r) => {
                                if (options.pipeline.list.exclude) {
                                    options.pipeline.list.exclude.forEach((e) => {
                                        delete r[e];
                                    });
                                }
                                return r;
                            });
                        }
                        if (options.pipeline.list.after) {
                            rawQuery = await options.pipeline.list.after(ctx, query, results);
                        }
                        return results;
                    }
                });
            }
            if (options.pipeline.detail) {
                this.functions.push({
                    path: options.path + "/detail",
                    method: options.pipeline.detail.method || "post",
                    fun: async function (ctx: NextContext<any>) {
                        let rawQuery = (ctx as any)[options.db || 'db'](options.pipeline.detail.collection || options.collection);

                        if (options.pipeline.detail.before) {
                            rawQuery = options.pipeline.detail.before(ctx, rawQuery);
                        }
                        if (options.pipeline.detail.projection) {
                            rawQuery = rawQuery.select(...options.pipeline.detail.projection);
                        }

                        if (options.pipeline.delete.customWhere) {
                            rawQuery = options.pipeline.delete.customWhere(ctx, rawQuery);
                        }
                        else {
                            if (options.pipeline.delete.whereFields) {
                                if (typeof options.pipeline.delete.whereFields === 'object') {
                                    for (let key in options.pipeline.delete.whereFields) {
                                        rawQuery = rawQuery.where(key, ctx.all[options.pipeline.delete.whereFields[key]]);
                                    }
                                }
                                else {
                                    rawQuery = rawQuery.where(options.pipeline.delete.whereFields, ctx.body.id);
                                }
                            }
                        }

                        let results = await rawQuery.catch(console.error);
                        let result = 0;
                        if (results && Array.isArray(results)) {
                            result = results[0];
                            if (result) {
                                if (options.pipeline.detail.exclude) {
                                    options.pipeline.detail.exclude.forEach((e) => {
                                        delete result[e];
                                    });
                                }
                            }
                        }
                        if (options.pipeline.detail.after) {
                            rawQuery = await options.pipeline.detail.after(ctx, result);
                        }
                        let response = new ApiResponse().setError("RECORD_NOT_FOUND");
                        if (result) {
                            response = new ApiResponse().setSuccess(result);
                        }
                        return response;
                    }
                });
            }
            if (options.pipeline.create) {
                this.functions.push({
                    path: options.path + "/create",
                    method: options.pipeline.create.method || "post",
                    validation: options.pipeline.create.validation,
                    fun: async function (ctx: NextContext<any>) {
                        let record = {};
                        if (options.pipeline.create.before) {
                            await options.pipeline.create.before(ctx, record);
                        }
                        if (options.pipeline.create.fields) {
                            for (let field of options.pipeline.create.fields) {
                                if (typeof field === 'string') {
                                    record[field] = ctx.all[field];
                                }
                                else {
                                    if (field.default) {
                                        record[field.name] = field.default;
                                    }
                                    if (field.value) {
                                        let v = field.value(ctx);
                                        if (v instanceof Promise) {
                                            v = await v.catch(console.error);
                                        }
                                        record[field.name] = v;
                                    }
                                }
                            }
                        }
                        let results = await (ctx as any)[options.db || 'db'](options.pipeline.create.collection || options.collection).insert(record).returning("Id").catch(console.error);
                        let result = 0;
                        if (results && Array.isArray(results)) {
                            result = results[0];
                        }
                        if (options.pipeline.create.after) {
                            await options.pipeline.create.after(ctx, result);
                        }
                        let response = new ApiResponse().setError("RECORD_NOT_CREATED");
                        if (result) {
                            response = new ApiResponse().setSuccess(result);
                        }
                        return response;
                    }
                });
            }
            if (options.pipeline.update) {
                this.functions.push({
                    path: options.path + "/update",
                    method: options.pipeline.update.method || "post",
                    validation: options.pipeline.create.validation,
                    fun: async function (ctx: NextContext<any>) {
                        let rawQuery = (ctx as any)[options.db || 'db'](options.pipeline.update.collection || options.collection);

                        if (options.pipeline.update.customWhere) {
                            rawQuery = options.pipeline.update.customWhere(ctx, rawQuery);
                        }
                        else {
                            if (options.pipeline.update.whereFields) {
                                if (typeof options.pipeline.update.whereFields === 'object') {
                                    for (let key in options.pipeline.update.whereFields) {
                                        rawQuery = rawQuery.where(key, ctx.all[options.pipeline.update.whereFields[key]]);
                                    }
                                }
                                else {
                                    rawQuery = rawQuery.where(options.pipeline.update.whereFields, ctx.body.id);
                                }
                            }
                        }

                        if (options.pipeline.update.before) {
                            rawQuery = options.pipeline.update.before(ctx, rawQuery);
                        }

                        let record = {};
                        if (options.pipeline.update.fields) {
                            for (let field of options.pipeline.update.fields) {
                                if (typeof field === 'string') {
                                    record[field] = ctx.all[field];
                                }
                                else {
                                    if (field.default) {
                                        record[field.name] = field.default;
                                    }
                                    if (field.value) {
                                        let v = field.value(ctx);
                                        if (v instanceof Promise) {
                                            v = await v.catch(console.error);
                                        }
                                        record[field.name] = v;
                                    }
                                }
                            }
                        }

                        let results = await rawQuery.update(record).catch(console.error);
                        let result = 0;
                        if (results && Array.isArray(results)) {
                            result = results[0];
                        }
                        if (options.pipeline.update.after) {
                            rawQuery = await options.pipeline.update.after(ctx, result);
                        }
                        let response = new ApiResponse().setError("RECORD_NOT_UPDATED");
                        if (result) {
                            response = new ApiResponse().setSuccess(result);
                        }
                        return response;
                    }
                });
            }
            if (options.pipeline.delete) {
                this.functions.push({
                    path: options.path + "/delete",
                    method: options.pipeline.delete.method || "post",
                    fun: async function (ctx: NextContext<any>) {
                        let rawQuery = (ctx as any)[options.db || 'db'](options.pipeline.delete.collection || options.collection);

                        if (options.pipeline.delete.customWhere) {
                            rawQuery = options.pipeline.delete.customWhere(ctx, rawQuery);
                        }
                        else {
                            if (options.pipeline.delete.whereFields) {
                                if (typeof options.pipeline.delete.whereFields === 'object') {
                                    for (let key in options.pipeline.delete.whereFields) {
                                        rawQuery = rawQuery.where(key, ctx.all[options.pipeline.delete.whereFields[key]]);
                                    }
                                }
                                else {
                                    rawQuery = rawQuery.where(options.pipeline.delete.whereFields, ctx.body.id);
                                }
                            }
                        }

                        if (options.pipeline.delete.before) {
                            rawQuery = options.pipeline.delete.before(ctx, rawQuery);
                        }

                        let record = {};
                        let isDeletePermanent = false;
                        if (options.pipeline.delete.deletedField) {
                            record[options.pipeline.delete.deletedField] = options.pipeline.delete.deletedValue;
                        }
                        else {
                            isDeletePermanent = true;
                        }

                        let results = null;
                        let result = 0;
                        if (isDeletePermanent) {
                            results = await rawQuery.delete().catch(console.error);
                            result = 0;
                            if (results && Array.isArray(results)) {
                                result = results[0];
                            }
                        }
                        else {
                            results = await rawQuery.update(record).catch(console.error);
                            result = 0;
                            if (results && Array.isArray(results)) {
                                result = results[0];
                            }
                        }
                        if (options.pipeline.delete.after) {
                            rawQuery = await options.pipeline.delete.after(ctx, result);
                        }
                        let response = new ApiResponse().setError("RECORD_NOT_DELETED");
                        if (result) {
                            response = new ApiResponse().setSuccess(result);
                        }
                        return response;
                    }
                });
            }

            if (options.pipeline.custom) {
                for (let custom of options.pipeline.custom) {
                    if (custom.mode == 'list') {
                        this.functions.push({
                            path: options.path + "/" + custom.name,
                            method: custom.method || "post",
                            fun: async function (ctx: NextContext<any>) {
                                let list = custom.list;
                                let rawQuery = (ctx as any)[options.db || 'db'](list.collection || options.collection);

                                if (list.customWhere) {
                                    rawQuery = list.customWhere(ctx, rawQuery);
                                }

                                if (list.before) {
                                    rawQuery = list.before(ctx, rawQuery);
                                }

                                if (list.projection) {
                                    rawQuery = rawQuery.select(...list.projection);
                                }

                                let query = knext(rawQuery);
                                query = query.build(ctx.all);

                                if (list.search) {
                                    query = query.search(ctx.all.search, ...list.search.fields);
                                }

                                let results = await query.retrieve();
                                if (results && results.data) {
                                    results.data = results.data.map((r) => {
                                        if (list.exclude) {
                                            list.exclude.forEach((e) => {
                                                delete r[e];
                                            });
                                        }
                                        return r;
                                    });
                                }
                                if (list.after) {
                                    rawQuery = await list.after(ctx, query, results);
                                }
                                return results;
                            }
                        });
                    }
                    else if (custom.mode == 'detail') {
                        this.functions.push({
                            path: options.path + "/" + custom.name,
                            method: custom.method || "post",
                            fun: async function (ctx: NextContext<any>) {
                                let detail = custom.detail;
                                let rawQuery = (ctx as any)[options.db || 'db'](detail.collection || options.collection);

                                if (detail.customWhere) {
                                    rawQuery = await detail.customWhere(ctx, rawQuery);
                                }
                                else {
                                    if (detail.whereFields) {
                                        if (typeof detail.whereFields === 'object') {
                                            for (let key in detail.whereFields) {
                                                rawQuery = rawQuery.where(key, ctx.all[detail.whereFields[key]]);
                                            }
                                        }
                                        else {
                                            rawQuery = rawQuery.where(detail.whereFields, ctx.body.id);
                                        }
                                    }
                                }

                                if (detail.before) {
                                    rawQuery = await detail.before(ctx, rawQuery);
                                }

                                if (detail.projection) {
                                    rawQuery = rawQuery.select(...detail.projection);
                                }

                                let query = knext(rawQuery);
                                query = query.build(ctx.all);

                                let results = await query.retrieve();
                                if (results && results.data) {
                                    results.data = results.data.map((r) => {
                                        if (detail.exclude) {
                                            detail.exclude.forEach((e) => {
                                                delete r[e];
                                            });
                                        }
                                        return r;
                                    });
                                }
                                if (detail.after) {
                                    rawQuery = await detail.after(ctx, query, results);
                                }
                                return results;
                            }
                        });
                    }
                    else {
                        this.functions.push({
                            path: options.path + "/" + custom.name,
                            method: custom.method || "post",
                            fun: async function (ctx: NextContext<any>) {
                                if (custom.before) {
                                    await custom.before(ctx).catch(console.error);
                                }
                                let results = await custom.action(ctx).catch(console.error);
                                if (custom.after) {
                                    results = await custom.after(ctx, results);
                                }
                                let response = new ApiResponse().setError("RECORD_NOT_FOUND");
                                if (results) {
                                    response = new ApiResponse().setSuccess(results);
                                }
                                return response;
                            }
                        });
                    }
                }
            }
        }
        return this;
    }
    public mount(app: NextApplication) {
        this.functions.forEach((f) => {
            let definition: NextRouteAction = {
                default: f.fun,
                validate: f.validation
            } as any;
            app.routeBuilder.registerAction(f.path, f.method, definition);
        });
    }
}