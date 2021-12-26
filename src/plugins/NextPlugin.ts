import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";

export class NextPlugin<T> {
    constructor(public name: string, public showInContext: boolean = false) { }
    public async init(next: NextApplication) {
    }
    public async middleware(next: NextContextBase): Promise<boolean> {
        return true;
    }
    public async destroy(next: NextApplication) {
    }
    public async retrieve(next: NextContextBase) : Promise<T>{
        return null;
    }
}