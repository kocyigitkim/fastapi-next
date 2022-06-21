import { Options as MulterOptions } from "multer";
import { NextApplication, NextContextBase, NextPlugin } from "..";
import { NextHealthCheckStatus } from "../config/NextOptions";
import { NextFlag } from "../NextFlag";
export declare class NextFile {
    path: string;
    name: string;
    size: number;
    type: string;
    content: string;
}
export declare class NextFileResolverPlugin extends NextPlugin<any> {
    config: MulterOptions;
    private app;
    constructor(config?: MulterOptions);
    init(next: NextApplication): Promise<void>;
    middleware(next: NextContextBase): Promise<boolean | NextFlag>;
    healthCheck(next: NextApplication): Promise<NextHealthCheckStatus>;
}
//# sourceMappingURL=NextFileResolverPlugin.d.ts.map