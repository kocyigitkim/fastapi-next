"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextOptions = void 0;
const NextSessionManager_1 = require("../NextSessionManager");
class NextOptions {
    constructor() {
        this.debug = false;
        this.port = 5000;
        this.session = new NextSessionManager_1.NextSessionManager();
        this.routerDirs = [];
    }
}
exports.NextOptions = NextOptions;
