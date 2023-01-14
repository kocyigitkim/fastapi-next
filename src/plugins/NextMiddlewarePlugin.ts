import { NextContextBase } from "..";
import { NextApplication } from "../NextApplication";
import { NextFlag } from "../NextFlag";
import { NextPlugin } from "./NextPlugin";

export class NextMiddlewarePlugin extends NextPlugin<any>{
    private func: (next: NextContextBase) => boolean | NextFlag | Promise<boolean | NextFlag>;
    public constructor(func: (next: NextContextBase) => boolean | NextFlag | Promise<boolean | NextFlag>) {
        super("");
        this.func = func;
    }
    public async middleware(next: NextContextBase): Promise<boolean | NextFlag> {
        return this.func(next);
    }
}