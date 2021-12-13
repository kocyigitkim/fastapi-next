import { NextApplication } from "../NextApplication";
import { NextContext } from "../NextContext";
import { NextPlugin } from "../plugins/NextPlugin";
export declare class NextCorsPlugin extends NextPlugin {
    constructor();
    init(app: NextApplication): Promise<void>;
    middleware(next: NextContext): Promise<boolean>;
    destroy(next: NextApplication): Promise<void>;
}
//# sourceMappingURL=NextCorsPlugin.d.ts.map