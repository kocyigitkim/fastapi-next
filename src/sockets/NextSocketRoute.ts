import { NextSocketAction } from "./NextSocketAction";

export class NextSocketRoute {
    public path: string;
    public action: NextSocketAction;
    public constructor(path: string, action: NextSocketAction) {
        this.path = path;
        this.action = action;
    }
}
