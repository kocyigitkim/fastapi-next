import { NextApplication, NextContextBase } from "..";
import { NextHealthCheckStatus } from "../config/NextOptions";
import { NextPlugin } from "./NextPlugin";

export class NextObjectPlugin extends NextPlugin<any>{
    constructor(public obj: any, name: string) {
        super(name, true);
    }
    public async retrieve(next: NextContextBase): Promise<any> {
        return this.obj;
    }
    public async healthCheck(next: NextApplication): Promise<NextHealthCheckStatus> {
        return NextHealthCheckStatus.Alive();
    }
}