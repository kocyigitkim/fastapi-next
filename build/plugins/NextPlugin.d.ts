import { NextApplication } from "../NextApplication";
import { NextContextBase } from "../NextContext";
export declare class NextPlugin<T> {
    name: string;
    showInContext: boolean;
    constructor(name: string, showInContext?: boolean);
    init(next: NextApplication): Promise<void>;
    middleware(next: NextContextBase): Promise<boolean>;
    destroy(next: NextApplication): Promise<void>;
    retrieve(next: NextContextBase): Promise<T>;
}
//# sourceMappingURL=NextPlugin.d.ts.map