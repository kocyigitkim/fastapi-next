import { Request, Response, NextFunction } from "express";
import { NextApplication } from "./NextApplication";
import { NextPlugin } from "./plugins/NextPlugin";
export declare class NextRegistry {
    private _plugins;
    private app;
    constructor(app: NextApplication);
    register(plugin: NextPlugin): void;
    getPlugins(): NextPlugin[];
    getPlugin(name: string): NextPlugin;
    destroy(): Promise<void>;
    middleware(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=NextRegistry.d.ts.map