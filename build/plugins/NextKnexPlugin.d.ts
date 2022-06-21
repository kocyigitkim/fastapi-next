import { NextPlugin } from "./NextPlugin";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";
import { NextHealthCheckStatus } from "../config/NextOptions";
export declare class NextKnexPlugin extends NextPlugin<any> {
    config: any;
    pluginName: string;
    private knex;
    constructor(config: any, pluginName?: string);
    init(app: NextApplication): Promise<void>;
    retrieve(next: NextContextBase): Promise<any>;
    healthCheck(next: NextApplication): Promise<NextHealthCheckStatus>;
}
//# sourceMappingURL=NextKnexPlugin.d.ts.map