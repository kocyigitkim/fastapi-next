"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextKnexPlugin = void 0;
const NextPlugin_1 = require("./NextPlugin");
const NextOptions_1 = require("../config/NextOptions");
class NextKnexPlugin extends NextPlugin_1.NextPlugin {
    constructor(config, pluginName = "db") {
        super(pluginName, true);
        this.config = config;
        this.pluginName = pluginName;
        this.knex = require.main.require("knex")(config);
    }
    async init(app) {
        app.log.info("Knex plugin loaded");
    }
    async retrieve(next) {
        return this.knex;
    }
    async healthCheck(next) {
        let result = await this.knex.raw("select 1 as alive").catch(() => { });
        if (this.knex.client.config.client === 'pg') {
            if (result && result.rows) {
                result = result.rows;
            }
        }
        if (Array.isArray(result) && result[0] && result[0].alive === 1) {
            return NextOptions_1.NextHealthCheckStatus.Alive();
        }
        else {
            return NextOptions_1.NextHealthCheckStatus.Dead();
        }
    }
}
exports.NextKnexPlugin = NextKnexPlugin;
