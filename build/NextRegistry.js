"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextRegistry = void 0;
class NextRegistry {
    constructor(app) {
        this.app = app;
        this._plugins = [];
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
}
exports.NextRegistry = NextRegistry;
