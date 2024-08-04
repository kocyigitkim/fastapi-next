import { knext } from "knex-next";
import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";


export class RetrieveManyAction extends WorkflowRouteAction {
    constructor(private dbSource: string, private tableName: string, private projection?: string[], private searchColumns?: string[], private searchField?: string, private filterField?: string, private sortByField?: string, private sortDirField?: string, private pageIndexField?: string, private pageSizeField?: string, private where?: any) {
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

        if (!db) {
            return result.setError('Database source not found', 500);
        }
        let dbQuery: any = db(this.tableName);
        let whereCondition: any = this.where;
        if (whereCondition) {
            whereCondition = context.map(whereCondition, args);
            dbQuery = dbQuery.where(whereCondition);
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

        const queryResult = await q.retrieve();

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
