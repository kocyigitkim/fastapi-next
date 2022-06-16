import { NextPlugin } from "./NextPlugin";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";

export class NextKnexPlugin extends NextPlugin<any>{
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
}