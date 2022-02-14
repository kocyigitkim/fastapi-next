"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextSessionManager = exports.NextSessionOptions = void 0;
const __1 = require("..");
const uuid_1 = require("uuid");
const utils_1 = require("../utils");
class NextSessionOptions {
    constructor() {
        this.enableForwardedHeader = true;
        this.enableIPCheck = true;
        this.resolveSessionId = null;
    }
}
exports.NextSessionOptions = NextSessionOptions;
class NextSessionManager {
    constructor(store, options) {
        this.store = store;
        this.options = options;
        if (!this.store)
            this.store = new __1.InMemorySessionStore({});
        if (!this.options) {
            this.options = new NextSessionOptions();
        }
        this.use = this.use.bind(this);
    }
    async use(req, res, next) {
        const _self = this;
        var sessionId = this.options.resolveSessionId ? await this.options.resolveSessionId(req) : req.header("sessionid");
        var forwardedIP = (req.header("x-forwarded-for") || req.header("x-request-client-ip") || req.header("x-client-ip"));
        var ip = (0, utils_1.formatIP)(req.socket.remoteAddress);
        if ((0, utils_1.isInternalIPAddress)(ip))
            ip = (0, utils_1.formatIP)(forwardedIP);
        var isV6 = (0, utils_1.checkIfValidIPV6)(ip);
        var userAgent = req.headers['user-agent'];
        var isNewSession = false;
        var isGranted = true;
        if (sessionId) {
            try {
                _self.store.touch(sessionId, req.session);
            }
            catch (err) {
                console.error(err);
            }
            var result = (await (0, utils_1.waitCallback)(_self.store, _self.store.get, sessionId));
            if (!result) {
                isNewSession = true;
                result = { session: {}, ip: !isV6 ? ip : null, ipv6: isV6 ? ip : null, userAgent: userAgent };
            }
            if (isV6 && !result.ipv6) {
                result.ipv6 = ip;
            }
            if (!isV6 && !result.ip) {
                result.ip = ip;
            }
            result.userAgent = userAgent;
            req.session = result.session || {};
            if (result && ((isV6 ? (result.ipv6 != ip) : (result.ip != ip)) || result.userAgent != userAgent)) {
                isGranted = false;
                req.session = {};
                req.sessionId = (0, uuid_1.v4)();
                req.userAgent = userAgent;
                sessionId = req.sessionId;
            }
        }
        else {
            sessionId = (0, uuid_1.v4)();
            res.setHeader("sessionid", sessionId);
            result = await (0, utils_1.waitCallback)(_self.store, _self.store.set, sessionId, {});
            req.session = {};
            isNewSession = true;
        }
        res.on('finish', () => {
            if ((!req.session || Object.keys(req.session).length == 0) && req.sessionId) {
                (0, utils_1.waitCallback)(_self.store, _self.store.destroy, sessionId);
            }
            else {
                (0, utils_1.waitCallback)(_self.store, _self.store.set, sessionId, result);
            }
        });
        req.sessionManager = _self;
        req.sessionId = sessionId;
        next();
    }
}
exports.NextSessionManager = NextSessionManager;
