import { Knex } from "knex";
import { NextPlugin } from "./NextPlugin";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";
export declare class NextKnexPlugin extends NextPlugin<Knex> {
    config: Knex.Config;
    pluginName: string;
    private knex;
    constructor(config: Knex.Config, pluginName?: string);
    init(app: NextApplication): Promise<void>;
    retrieve(next: NextContextBase): Promise<Knex>;
}
//# sourceMappingURL=NextKnexPlugin.d.ts.map