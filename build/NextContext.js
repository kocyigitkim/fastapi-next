"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextContextBase = void 0;
class NextContextBase {
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
        this.files = req.files;
        this.fileCount = req.fileCount;
        this.ip = req.ip;
        this.ipv4 = ((req.ip || "").split(":")[0]) === req.ip;
        this.ipv6 = !this.ipv4;
        this.method = req.method;
        this.url = req.url;
        this.path = req.path;
        this.session = req.session;
        this.sessionId = (this.session && this.session.id) || req.sessionId;
    }
    //#endregion
    get token() {
        return this.req.token || this.req.access_token || this.req.accessToken || null;
    }
}
exports.NextContextBase = NextContextBase;
