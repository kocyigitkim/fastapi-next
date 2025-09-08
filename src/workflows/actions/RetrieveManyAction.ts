import { knext } from "knex-next";
import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";
import { invokeDbHooks } from '../DbHookInvoker';
import { NextPlugin } from '../../plugins/NextPlugin';


export class RetrieveManyAction extends WorkflowRouteAction {
    constructor(
        private dbSource: string,
        private tableName: string,
        private projection?: string[],
        private searchColumns?: string[],
        private searchField?: string,
        private filterField?: string,
        private sortByField?: string,
        private sortDirField?: string,
        private pageIndexField?: string,
        private pageSizeField?: string,
        private where?: any,
        private customWhere?: (context: WorkflowExecuteContext, query: any, args?: any) => any | Promise<any>
    ) {
        super("retrieveMany");

        if (!this.searchColumns) {
            this.searchColumns = [];
        }
        if (!this.filterField) {
            this.filterField = "$.filter";
        }
        if (!this.sortByField) {
            this.sortByField = "$.sort.column";
        }
        if (!this.sortDirField) {
            this.sortDirField = "$.sort.direction";
        }
        if (!this.pageIndexField) {
            this.pageIndexField = "$.pagination.page";
        }
        if (!this.pageSizeField) {
            this.pageSizeField = "$.pagination.pageSize";
        }
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );
        const args = context.getCurrentArgs(CurrentArgsSource.all);

    const db = context.nextContext?.[this.dbSource];
    const plugin: NextPlugin<any> = context.nextContext.app?.registry?.getPlugin?.(this.dbSource);

        if (!db) {
            return result.setError('Database source not found', 500);
        }
        let dbQuery: any = db(this.tableName);
        let whereCondition: any = this.where;
        if (whereCondition) {
            whereCondition = context.map(whereCondition, args);
            dbQuery = dbQuery.where(whereCondition);
        }
        if (this.customWhere) {
            const maybeQuery = await this.customWhere(context, dbQuery, args);
            const resolved = (maybeQuery && (maybeQuery.query && typeof maybeQuery.query.orderBy === 'function') ? maybeQuery.query : maybeQuery);
            if (resolved && typeof resolved.orderBy === 'function' && typeof resolved.where === 'function') {
                dbQuery = resolved;
            }
        }
        if (this.projection?.length > 0) {
            dbQuery = dbQuery.select(this.projection);
        }
        let q = knext(dbQuery);
        if (this.searchColumns.length > 0) {
            let searchText = context.queryParam(args, this.searchField);
            q = q.search(searchText, ...this.searchColumns);
        }

        let filterBody = context.queryParam(args, this.filterField);
        if (filterBody) {
            q = q.filter(filterBody);
        }

        let sortColumn = context.queryParam(args, this.sortByField);
        let sortDir = context.queryParam(args, this.sortDirField);

        if (sortColumn) {
            q = q.sort(sortColumn, sortDir || "asc");
        }

        let pageIndex = context.queryParam(args, this.pageIndexField);
        let pageSize = context.queryParam(args, this.pageSizeField);

        if (pageIndex !== undefined && pageSize !== undefined) {
            q = q.paginate(pageIndex, pageSize);
        }

        if(!(await invokeDbHooks(plugin,'before','select',{ table: this.tableName, where: whereCondition, options: { search: this.searchColumns, projection: this.projection }, query: dbQuery, nextContext: context.nextContext, workflow: context, action: this }))) {
            return result.setError('Select cancelled by middleware', 400);
        }
        const queryResult = await q.retrieve();
        if(queryResult.success) {
            await invokeDbHooks(plugin,'after','select',{ table: this.tableName, where: whereCondition, result: queryResult.data, options: { meta: queryResult }, query: dbQuery, nextContext: context.nextContext, workflow: context, action: this });
        }

        if (queryResult.success) {
            let r = result.setSuccess(queryResult.data);
            r = Object.assign(r, queryResult) as any;
            return r;
        }
        else {
            return result.setError(queryResult.message.toString(), 500);
        }

        return result;
    }
}
