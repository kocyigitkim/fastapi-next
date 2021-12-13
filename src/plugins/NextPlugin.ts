import { NextApplication } from "../NextApplication";
import { NextContext } from "../NextContext";

export class NextPlugin {
    constructor(public name: string, public showInContext: boolean = false) { }
    public async init(next: NextApplication) {
    }
    public async middleware(next: NextContext): Promise<boolean> {
        return false;
    }
    public async destroy(next: NextApplication) {
    }
}