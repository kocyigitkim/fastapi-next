import { Knex } from "knex";
import { NextPlugin } from "../plugins/NextPlugin";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";
export declare class NextKnexPlugin extends NextPlugin<Knex> {
    config: Knex.Config;
    private knex;
    constructor(config: Knex.Config);
    init(app: NextApplication): Promise<void>;
    retrieve(next: NextContextBase): Promise<Knex>;
}
//# sourceMappingURL=NextKnexPlugin.d.ts.map