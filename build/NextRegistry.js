"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextRegistry = void 0;
const NextObjectPlugin_1 = require("./plugins/NextObjectPlugin");
const NextMiddlewarePlugin_1 = require("./plugins/NextMiddlewarePlugin");
class NextRegistry {
    constructor(app) {
        this.app = app;
        this._plugins = [];
    }
    register(plugin) {
        this._plugins.push(plugin);
    }
    registerMiddleware(func) {
        this.register(new NextMiddlewarePlugin_1.NextMiddlewarePlugin(func));
    }
    registerObject(name, obj) {
        this.register(new NextObjectPlugin_1.NextObjectPlugin(obj, name));
    }
    getPlugins() {
        return this._plugins;
    }
    getPlugin(name) {
        return this._plugins.find(plugin => plugin.name === name);
    }
    async destroy() {
        await Promise.all(this._plugins.map(plugin => plugin.destroy(this.app)));
    }
}
exports.NextRegistry = NextRegistry;
