"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextPlugin = void 0;
const NextOptions_1 = require("../config/NextOptions");
class NextPlugin {
    constructor(name, showInContext = false) {
        this.name = name;
        this.showInContext = showInContext;
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
    async healthCheck(next) {
        return NextOptions_1.NextHealthCheckStatus.Dead();
    }
}
exports.NextPlugin = NextPlugin;
