"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextOptions = void 0;
class NextOptions {
    constructor() {
        this.debug = false;
        this.port = 5000;
        this.routerDirs = [];
        this.cors = null;
        this.authorization = null;
        this.sockets = null;
        this.socketRouterDirs = [];
    }
}
exports.NextOptions = NextOptions;
