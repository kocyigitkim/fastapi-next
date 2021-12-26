import { Options as MulterOptions } from "multer";
import { NextApplication, NextContextBase, NextPlugin } from "..";
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
    middleware(next: NextContextBase): Promise<boolean>;
}
//# sourceMappingURL=NextFileResolverPlugin.d.ts.map