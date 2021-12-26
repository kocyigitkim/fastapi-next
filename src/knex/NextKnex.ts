import knex, { Knex } from "knex";

export interface INextKnex<T = any> extends Knex<T> {
    paginate(page: number, count: number): INextKnex<T>;
}

export class NextKnex {
    constructor(public knex: Knex) {
        this.addPagination();
    }
    addPagination() {
      
    }
}