"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextKnexPlugin = void 0;
const knex_1 = __importDefault(require("knex"));
const NextPlugin_1 = require("./NextPlugin");
function configureKnexDialect(config) {
    var clientName = null;
    if (typeof config.client === 'string') {
        clientName = config.client;
    }
    else if (typeof config.dialect === 'string') {
        clientName = config.dialect;
    }
    if (clientName) {
        switch (clientName) {
            case "mssql":
            case "mysql":
            case "mysql2":
            case "oracle":
            case "oracledb":
            case "pgnative":
            case "postgres":
            case "redshift":
            case "sqlite3":
            case "cockroachdb":
                {
                    config.client = require('knex/lib/dialects/' + clientName);
                    if (config.dialect)
                        delete config.dialect;
                }
                break;
            default:
                throw new Error("Unsupported client: " + clientName);
                break;
        }
    }
    return config;
}
class NextKnexPlugin extends NextPlugin_1.NextPlugin {
    constructor(config, pluginName = "db") {
        super(pluginName, true);
        this.config = config;
        this.pluginName = pluginName;
        this.knex = (0, knex_1.default)(configureKnexDialect(config));
    }
    async init(app) {
        app.log.info("Knex plugin loaded");
    }
    async retrieve(next) {
        return this.knex;
    }
}
exports.NextKnexPlugin = NextKnexPlugin;
