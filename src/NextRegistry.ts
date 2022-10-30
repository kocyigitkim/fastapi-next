import { Request, Response, NextFunction } from "express";
import { NextContext } from ".";
import { NextApplication } from "./NextApplication";
import { NextPlugin } from "./plugins/NextPlugin";
import { NextFlag } from './NextFlag'

export class NextRegistry {
    private _plugins: NextPlugin<any>[];
    private app: NextApplication;
    public constructor(app: NextApplication) {
        this.app = app;
        this._plugins = [];
    }

    public register<T = any>(plugin: NextPlugin<T> | any) {
        this._plugins.push(plugin);
    }
    public registerMiddleware(func: () => boolean | NextFlag | Promise<boolean | NextFlag>) {
        this._plugins.push({
            middleware: func.bind({}) as any
        } as any);
    }
    public registerObject(name: string, obj: any) {
        this._plugins.push({
            name: name,
            retrieve: () => obj
        } as any);
    }
    public getPlugins(): NextPlugin<any>[] {
        return this._plugins;
    }
    public getPlugin(name: string): NextPlugin<any> {
        return this._plugins.find(plugin => plugin.name === name);
    }
    public async destroy(): Promise<void> {
        await Promise.all(this._plugins.map(plugin => plugin.destroy(this.app)));
    }
}