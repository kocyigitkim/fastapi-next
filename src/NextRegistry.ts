import { Request, Response, NextFunction } from "express";
import { NextContext } from ".";
import { NextApplication } from "./NextApplication";
import { NextPlugin } from "./plugins/NextPlugin";

export class NextRegistry {
    private _plugins: NextPlugin<any>[];
    private app: NextApplication;
    public constructor(app: NextApplication) {
        this.app = app;
        this._plugins = [];
    }

    public register(plugin: NextPlugin<any>) {
        this._plugins.push(plugin);
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