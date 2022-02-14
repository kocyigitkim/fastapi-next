import knex, { Knex } from "knex";
import { NextPlugin } from "./NextPlugin";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";


export class NextKnexPlugin extends NextPlugin<Knex>{
    private knex: Knex;
    constructor(public config: Knex.Config, public pluginName: string = "db") {
        super(pluginName, true);
        this.knex = knex(config);
        
    }
    public async init(app: NextApplication): Promise<void> {
        app.log.info("Knex plugin loaded");
    }
    public async retrieve(next: NextContextBase): Promise<Knex>{
        return this.knex;
    }
}