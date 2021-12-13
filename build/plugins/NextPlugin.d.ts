import { NextApplication } from "../NextApplication";
import { NextContext } from "../NextContext";
export declare class NextPlugin {
    name: string;
    showInContext: boolean;
    constructor(name: string, showInContext?: boolean);
    init(next: NextApplication): Promise<void>;
    middleware(next: NextContext): Promise<boolean>;
    destroy(next: NextApplication): Promise<void>;
}
//# sourceMappingURL=NextPlugin.d.ts.map