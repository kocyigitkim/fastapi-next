import { NextPlugin } from "./NextPlugin";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";
import { NextHealthCheckStatus } from "../config/NextOptions";

export class NextKnexPlugin extends NextPlugin<any> {
    private knex: any;
    constructor(public config: any, public pluginName: string = "db") {
        super(pluginName, true);
        this.knex = require.main.require("knex")(config);
    }
    public async init(app: NextApplication): Promise<void> {
        app.log.info("Knex plugin loaded");
    }
    public async retrieve(next: NextContextBase): Promise<any> {
        return this.knex;
    }
    public async healthCheck(next: NextApplication): Promise<NextHealthCheckStatus> {
        let result = await this.knex.raw("select 1 as alive").catch(() => { });
        if (this.knex.client.config.client === 'pg') {
            if (result && result.rows) {
                result = result.rows;
            }
        }
        if (Array.isArray(result) && result[0] && result[0].alive === 1) {
            return NextHealthCheckStatus.Alive();
        }
        else {
            return NextHealthCheckStatus.Dead();
        }
    }
}