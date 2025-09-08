"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextPlugin = void 0;
const NextOptions_1 = require("../config/NextOptions");
class NextPlugin {
    constructor(name, showInContext = false) {
        this.name = name;
        this.showInContext = showInContext;
        this._dbMiddlewares = [];
    }
    async init(next) {
    }
    async middleware(next) {
        return true;
    }
    async destroy(next) {
    }
    async retrieve(next) {
        return null;
    }
    async disposeInstance(next, instance) { }
    async healthCheck(next) {
        return NextOptions_1.NextHealthCheckStatus.Dead();
    }
    registerDbMiddleware(mw) {
        this._dbMiddlewares.push(mw);
        this._dbMiddlewares.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }
    getDbMiddlewares() { return this._dbMiddlewares; }
}
exports.NextPlugin = NextPlugin;
