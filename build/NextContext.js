"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextContextBase = void 0;
class NextContextBase {
    //#endregion
    get token() {
        return this.req.token || this.req.access_token || this.req.accessToken || null;
    }
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
        this.body = req.body;
        this.query = req.query;
        this.params = req.params;
        this.all = Object.assign(Object.assign(Object.assign({}, req.params), req.query), req.body);
        this.cookies = req.cookies;
        this.headers = req.headers;
        this.protocol = req.protocol;
        this.files = req.files;
        this.fileCount = req.fileCount;
        this.ip = (req.clientIp) || req.ip;
        this.ipv4 = ((req.ip || "").split(":")[0]) === req.ip;
        this.ipv6 = !this.ipv4;
        this.method = req.method;
        this.url = req.url;
        this.path = req.path;
        this.session = req.session;
        this.sessionId = (this.session && this.session.id) || req.sessionId;
        if (req.query && req.query["callback_sid"]) {
            this.sessionId = req.query["callback_sid"];
        }
        this.items = {};
    }
}
exports.NextContextBase = NextContextBase;
