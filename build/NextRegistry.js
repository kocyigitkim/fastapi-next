"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextRegistry = void 0;
const _1 = require(".");
class NextRegistry {
    constructor(app) {
        this.app = app;
        this._plugins = [];
        this.middleware = this.middleware.bind(this);
    }
    register(plugin) {
        this._plugins.push(plugin);
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
    async middleware(req, res, next) {
        var context = new _1.NextContext(req, res, next);
        await Promise.all(this._plugins.map(plugin => plugin.middleware(context)));
    }
}
exports.NextRegistry = NextRegistry;
