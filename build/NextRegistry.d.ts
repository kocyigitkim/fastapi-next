import { NextApplication } from "./NextApplication";
import { NextPlugin } from "./plugins/NextPlugin";
export declare class NextRegistry {
    private _plugins;
    private app;
    constructor(app: NextApplication);
    register<T = any>(plugin: NextPlugin<T> | any): void;
    getPlugins(): NextPlugin<any>[];
    getPlugin(name: string): NextPlugin<any>;
    destroy(): Promise<void>;
}
//# sourceMappingURL=NextRegistry.d.ts.map