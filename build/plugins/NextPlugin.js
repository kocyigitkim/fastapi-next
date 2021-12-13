"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextPlugin = void 0;
class NextPlugin {
    constructor(name, showInContext = false) {
        this.name = name;
        this.showInContext = showInContext;
    }
    async init(next) {
    }
    async middleware(next) {
        return false;
    }
    async destroy(next) {
    }
}
exports.NextPlugin = NextPlugin;
