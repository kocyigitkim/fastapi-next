import { NextApplication, NextContext, NextPlugin } from "..";
export declare class NextFile {
    path: string;
    name: string;
    size: number;
    type: string;
    content: string;
}
export declare class NextFileResolverPlugin extends NextPlugin {
    private client;
    constructor();
    init(next: NextApplication): Promise<void>;
    middleware(next: NextContext): Promise<boolean>;
}
//# sourceMappingURL=NextFileResolverPlugin.d.ts.map