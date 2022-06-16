"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextKnexPlugin = void 0;
const NextPlugin_1 = require("./NextPlugin");
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
}
exports.NextKnexPlugin = NextKnexPlugin;
