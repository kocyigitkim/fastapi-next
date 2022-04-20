import { NextContextBase } from "..";
import { NextPlugin } from "./NextPlugin";

export class NextObjectPlugin extends NextPlugin<any>{
    constructor(public obj: any, name: string) {
        super(name, true);
    }
    public async retrieve(next: NextContextBase): Promise<any> {
        return this.obj;
    }
}