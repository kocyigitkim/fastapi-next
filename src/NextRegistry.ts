import { Request, Response, NextFunction } from "express";
import { NextContext } from ".";
import { NextApplication } from "./NextApplication";
import { NextPlugin } from "./plugins/NextPlugin";

export class NextRegistry {
    private _plugins: NextPlugin[];
    private app: NextApplication;
    public constructor(app: NextApplication) {
        this.app = app;
        this._plugins = [];
        this.middleware = this.middleware.bind(this);
    }

    public register(plugin: NextPlugin) {
        this._plugins.push(plugin);
    }
    public getPlugins(): NextPlugin[] {
        return this._plugins;
    }
    public getPlugin(name: string): NextPlugin {
        return this._plugins.find(plugin => plugin.name === name);
    }
    public async destroy(): Promise<void> {
        await Promise.all(this._plugins.map(plugin => plugin.destroy(this.app)));
    }
    public async middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
        var context = new NextContext(req, res, next);
        await Promise.all(this._plugins.map(plugin => plugin.middleware(context)));
    }
}