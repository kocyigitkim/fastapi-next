import { NextPlugin } from "./NextPlugin";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";
export declare class NextKnexPlugin extends NextPlugin<any> {
    config: any;
    pluginName: string;
    private knex;
    constructor(config: any, pluginName?: string);
    init(app: NextApplication): Promise<void>;
    retrieve(next: NextContextBase): Promise<any>;
}
//# sourceMappingURL=NextKnexPlugin.d.ts.map