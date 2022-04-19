import knex, { Knex } from "knex";
import { NextPlugin } from "./NextPlugin";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";

function configureKnexDialect(config: Knex.Config) {
    var clientName: string = null;
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
                    config.client = require('knex/lib/dialects/' + clientName) as any;
                    if (config.dialect) delete config.dialect;
                }
                break;
            default:
                throw new Error("Unsupported client: " + clientName);
                break;
        }
    }
    return config;
}

export class NextKnexPlugin extends NextPlugin<Knex>{
    private knex: Knex;
    constructor(public config: Knex.Config, public pluginName: string = "db") {
        super(pluginName, true);
        this.knex = knex(configureKnexDialect(config));
    }
    public async init(app: NextApplication): Promise<void> {
        app.log.info("Knex plugin loaded");
    }
    public async retrieve(next: NextContextBase): Promise<Knex> {
        return this.knex;
    }
}