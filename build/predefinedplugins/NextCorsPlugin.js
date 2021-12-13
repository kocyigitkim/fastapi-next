"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextCorsPlugin = void 0;
const NextPlugin_1 = require("../plugins/NextPlugin");
class NextCorsPlugin extends NextPlugin_1.NextPlugin {
    constructor() {
        super("cors", false);
    }
    async init(app) {
        app.log.info("CORS plugin loaded");
    }
    async middleware(next) {
        next.res.setHeader("Access-Control-Allow-Origin", "*");
        next.res.setHeader("Access-Control-Allow-Methods", "*");
        next.res.setHeader("Access-Control-Allow-Headers", "*");
        next.res.setHeader("Access-Control-Max-Age", "86400");
        next.res.setHeader("x-frame-options", "SAMEORIGIN");
        next.res.setHeader("X-XSS-Protection", "0");
        if (next.req.method === "OPTIONS") {
            next.res.sendStatus(200);
        }
        else {
            next.next();
        }
        return false;
    }
    async destroy(next) {
    }
}
exports.NextCorsPlugin = NextCorsPlugin;
