import { NextApplication } from "./NextApplication";
import { NextPlugin } from "./plugins/NextPlugin";
import { NextFlag } from './NextFlag';
export declare class NextRegistry {
    private _plugins;
    private app;
    constructor(app: NextApplication);
    register<T = any>(plugin: NextPlugin<T> | any): void;
    registerMiddleware(func: () => boolean | NextFlag | Promise<boolean | NextFlag>): void;
    registerObject(name: string, obj: any): void;
    getPlugins(): NextPlugin<any>[];
    getPlugin(name: string): NextPlugin<any>;
    destroy(): Promise<void>;
}
//# sourceMappingURL=NextRegistry.d.ts.map