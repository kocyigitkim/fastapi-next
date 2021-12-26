import { Knex } from "knex";
export interface INextKnex<T = any> extends Knex<T> {
    paginate(page: number, count: number): INextKnex<T>;
}
export declare class NextKnex {
    knex: Knex;
    constructor(knex: Knex);
    addPagination(): void;
}
//# sourceMappingURL=NextKnex.d.ts.map