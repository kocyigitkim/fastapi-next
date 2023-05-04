import { NextHealthCheckStatus } from "../config/NextOptions";
import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";
import { NextFlag } from "../NextFlag";

export class NextPlugin<T> {
    constructor(public name: string, public showInContext: boolean = false) { }
    public async init(next: NextApplication) {
    }
    public async middleware(next: NextContextBase): Promise<boolean | NextFlag> {
        return true;
    }
    public async destroy(next: NextApplication) {
    }
    public async retrieve(next: NextContextBase): Promise<T> {
        return null;
    }
    public async disposeInstance(next: NextContextBase, instance: T): Promise<void> { }
    public async healthCheck(next: NextApplication): Promise<NextHealthCheckStatus> {
        return NextHealthCheckStatus.Dead();
    }
}