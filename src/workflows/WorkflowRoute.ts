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
import { IfAction, IfCondition, IfElse, IfThen } from "./actions/IfAction";
import { LogAction } from "./actions/LogAction";
import { RetryAction } from "./actions/RetryAction";
import { TransformAction } from "./actions/TransformAction";
import { ActionBuilder, ParallelAction } from "./actions/ParallelAction";
import { SwitchAction, CaseValue, CaseHandler } from "./actions/SwitchAction";
import { CacheAction, CacheMode } from "./actions/CacheAction";
import { LimiterAction } from "./actions/LimiterAction";
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

// Interface for tracking performance metrics
interface WorkflowPerformanceMetrics {
    routeId?: string;
    executionStartTime: number;
    executionEndTime?: number;
    totalExecutionTimeMs?: number;
    success: boolean;
    actionMetrics: {
        actionType: string;
        startTime: number;
        endTime?: number;
        executionTimeMs?: number;
        success: boolean;
    }[];
}

export class WorkflowRoute {
    actions: WorkflowRouteAction[];
    httpMethod: string[] = [];
    public description: string;
    public summary: string;
    public tags: string;
    public isDeprecated?: boolean;
    public id?: string; // Database ID for dynamic routes
    public performanceMetricsEnabled: boolean = false;
    private metricsDbPlugin?: any;
    private metricsDbTable?: string;

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

    enableMetrics(dbPlugin?: any, tableName?: string) {
        this.performanceMetricsEnabled = true;
        this.metricsDbPlugin = dbPlugin;
        this.metricsDbTable = tableName || 'workflow_metrics';
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
    custom(func: (ctx: WorkflowExecuteContext) => Promise<WorkflowRouteActionResult>) {
        let builded = new WorkflowRouteAction("custom");
        builded.execute = func;
        return this.action(builded);
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

    public if(condition: IfCondition, isTrue?: IfThen, isFalse?: IfElse) {
        return this.action(new IfAction(condition, isTrue, isFalse));
    }

    validate(schema: yup.AnySchema) {
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

    log(options: {
        message?: string,
        logLevel?: 'info' | 'warn' | 'error' | 'debug',
        includeContext?: boolean,
        contextPath?: string
    } = {}) {
        return this.action(new LogAction(
            options.message,
            options.logLevel,
            options.includeContext,
            options.contextPath
        ));
    }

    retry(options: {
        action: (route: WorkflowRoute) => WorkflowRoute,
        maxAttempts?: number,
        delayMs?: number,
        retryCondition?: (result: WorkflowRouteActionResult) => boolean
    }) {
        return this.action(new RetryAction(
            options.action,
            options.maxAttempts,
            options.delayMs,
            options.retryCondition
        ));
    }

    transform(options: {
        source: CurrentArgsSource,
        transformFn: ((data: any, context: WorkflowExecuteContext) => any | Promise<any>) | Array<(data: any, context: WorkflowExecuteContext) => any | Promise<any>>,
        sourceKey?: string
    }) {
        return this.action(new TransformAction(
            options.source,
            options.transformFn,
            options.sourceKey
        ));
    }

    parallel(options: {
        actions: ActionBuilder[],
        failFast?: boolean,
        maxConcurrent?: number
    }) {
        return this.action(new ParallelAction(
            options.actions,
            {
                failFast: options.failFast,
                maxConcurrent: options.maxConcurrent
            }
        ));
    }

    switch(expression: string | ((ctx: WorkflowExecuteContext) => string | number | boolean | Promise<string | number | boolean>), source?: CurrentArgsSource) {
        return this.action(new SwitchAction(expression, source));
    }

    cache(options: {
        key: string | ((ctx: WorkflowExecuteContext) => string),
        mode?: CacheMode,
        ttlMs?: number,
        action?: (route: WorkflowRoute) => WorkflowRoute,
        fallbackValue?: any
    }) {
        return this.action(new CacheAction(
            options.key,
            options.mode,
            {
                ttlMs: options.ttlMs,
                actionBuilder: options.action,
                fallbackValue: options.fallbackValue
            }
        ));
    }

    limit(options: {
        key: string | ((ctx: WorkflowExecuteContext) => string),
        limit: number,
        windowMs: number,
        action?: (route: WorkflowRoute) => WorkflowRoute,
        errorMessage?: string,
        errorStatus?: number
    }) {
        return this.action(new LimiterAction(
            options.key,
            {
                limit: options.limit,
                windowMs: options.windowMs,
                actionBuilder: options.action,
                errorMessage: options.errorMessage,
                errorStatus: options.errorStatus
            }
        ));
    }

    public getPath() {
        return [this.router.getPath(), this.path].join("/");
    }

    public async execute(nextContext: NextContextBase, currentContext?: WorkflowExecuteContext) {
        let context = currentContext || new WorkflowExecuteContext(this, nextContext);
        
        // Initialize performance tracking if enabled
        let performanceMetrics: WorkflowPerformanceMetrics | undefined;
        if (this.performanceMetricsEnabled) {
            performanceMetrics = {
                routeId: this.id,
                executionStartTime: Date.now(),
                success: false,
                actionMetrics: []
            };
        }
        
        for (let action of this.actions) {
            if (action.definitionOnly) continue;

            // Track action start time
            const actionStartTime = this.performanceMetricsEnabled ? Date.now() : 0;
            
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
            
            // Track action performance
            if (this.performanceMetricsEnabled && performanceMetrics) {
                const actionEndTime = Date.now();
                performanceMetrics.actionMetrics.push({
                    actionType: action.constructor.name,
                    startTime: actionStartTime,
                    endTime: actionEndTime,
                    executionTimeMs: actionEndTime - actionStartTime,
                    success: actionResult.success === true
                });
            }
            
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
        
        // Complete performance tracking
        if (this.performanceMetricsEnabled && performanceMetrics) {
            performanceMetrics.executionEndTime = Date.now();
            performanceMetrics.totalExecutionTimeMs = 
                performanceMetrics.executionEndTime - performanceMetrics.executionStartTime;
            performanceMetrics.success = result.success;
            
            // Save metrics asynchronously
            this.savePerformanceMetrics(performanceMetrics).catch(err => {
                console.error('Failed to save performance metrics:', err);
            });
        }
        
        return result;
    }
    
    private async savePerformanceMetrics(metrics: WorkflowPerformanceMetrics): Promise<void> {
        if (!this.performanceMetricsEnabled || !this.metricsDbPlugin || !this.id) {
            return;
        }
        
        try {
            const metricsTable = this.metricsDbTable || 'workflow_metrics';
            
            // Check if there's an existing record
            const existingRecord = await this.metricsDbPlugin.queryOne(
                `SELECT * FROM ${metricsTable} WHERE route_id = ?`,
                [this.id]
            );
            
            if (existingRecord) {
                // Update existing record
                const newTotalExecutions = existingRecord.total_executions + 1;
                const newAvgTime = existingRecord.avg_execution_time_ms + 
                    (metrics.totalExecutionTimeMs - existingRecord.avg_execution_time_ms) / newTotalExecutions;
                const newSuccessRate = existingRecord.success_rate + 
                    (metrics.success ? 1 : 0 - existingRecord.success_rate) / newTotalExecutions;
                
                await this.metricsDbPlugin.execute(
                    `UPDATE ${metricsTable} 
                    SET total_executions = ?, 
                        avg_execution_time_ms = ?, 
                        success_rate = ?,
                        last_executed_at = NOW(),
                        metrics_data = JSON_MERGE_PATCH(IFNULL(metrics_data, '{}'), ?)
                    WHERE route_id = ?`,
                    [
                        newTotalExecutions,
                        newAvgTime,
                        newSuccessRate,
                        JSON.stringify({
                            lastExecution: {
                                timestamp: new Date().toISOString(),
                                executionTimeMs: metrics.totalExecutionTimeMs,
                                success: metrics.success,
                                actionMetrics: metrics.actionMetrics
                            }
                        }),
                        this.id
                    ]
                );
            } else {
                // Create new record
                const metricId = this.generateUuid();
                await this.metricsDbPlugin.execute(
                    `INSERT INTO ${metricsTable} 
                    (id, route_id, total_executions, avg_execution_time_ms, success_rate, 
                     last_executed_at, metrics_data)
                    VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
                    [
                        metricId,
                        this.id,
                        1,
                        metrics.totalExecutionTimeMs,
                        metrics.success ? 1 : 0,
                        JSON.stringify({
                            lastExecution: {
                                timestamp: new Date().toISOString(),
                                executionTimeMs: metrics.totalExecutionTimeMs,
                                success: metrics.success,
                                actionMetrics: metrics.actionMetrics
                            }
                        })
                    ]
                );
            }
        } catch (error) {
            console.error('Error saving performance metrics:', error);
        }
    }
    
    private generateUuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public buildExecutionResult(actionResult: WorkflowRouteActionResult) {
        let result = new WorkflowExecutionResult();
        result.success = actionResult.success;
        result.error = actionResult.error ? [actionResult.error] : undefined;
        result.status = actionResult.status;
        result.result = actionResult.data;
        return result;
    }

    public buildActionResult(result: WorkflowExecutionResult) {
        let actionResult = new WorkflowRouteActionResult();
        actionResult.success = result.success;
        actionResult.error = result.error ? result.error[0] : undefined;
        actionResult.status = result.status;
        actionResult.data = result.result;
        return actionResult;
    }
}
