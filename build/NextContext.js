"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextContext = void 0;
class NextContext {
    //#endregion
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
        this.body = req.body;
        this.query = req.query;
        this.params = req.params;
        this.cookies = req.cookies;
        this.headers = req.headers;
        this.protocol = req.protocol;
        this.ip = req.ip;
        this.ipv4 = ((req.ip || "").split(":")[0]) === req.ip;
        this.ipv6 = !this.ipv4;
        this.method = req.method;
        this.url = req.url;
        this.path = req.path;
        this.session = req.session;
        this.sessionId = req.sessionId;
    }
}
exports.NextContext = NextContext;
