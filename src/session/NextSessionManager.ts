import { NextFunction, Request, Response } from "express";
import { InMemorySessionStore } from "..";
import { ISessionStore } from "./ISessionStore";

import { v4 as uuid } from 'uuid';
import { checkIfValidIPV6, formatIP, isInternalIPAddress, waitCallback } from '../utils';

export interface NextSessionIdResolver {
    (req: Request): Promise<string>;
}
export class NextSessionOptions {
    public enableForwardedHeader?: boolean = true;
    public enableIPCheck?: boolean = true;
    public resolveSessionId?: NextSessionIdResolver = null;
}
export class NextSessionManager {
    constructor(public store: ISessionStore, public options?: NextSessionOptions) {
        if (!this.store) this.store = new InMemorySessionStore({});
        if (!this.options) {
            this.options = new NextSessionOptions();
        }
        this.use = this.use.bind(this);
    }

    async use(req: Request & { session: any, sessionId: any, userAgent: any }, res: Response, next: NextFunction) {
        const _self = this;
        var sessionId = this.options.resolveSessionId ? await this.options.resolveSessionId(req) : req.header("sessionid");
        var forwardedIP = (req.header("x-forwarded-for") || req.header("x-request-client-ip") || req.header("x-client-ip"));
        var ip = formatIP(req.socket.remoteAddress);
        if (isInternalIPAddress(ip)) ip = formatIP(forwardedIP);
        var isV6 = checkIfValidIPV6(ip);

        var userAgent = req.headers['user-agent'];
        var isNewSession = false;
        var isGranted = true;
        if (sessionId) {
            try {
                _self.store.touch(sessionId, req.session);
            } catch (err) { console.error(err); }
            var result: any = (await waitCallback(_self.store, _self.store.get, sessionId));
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
                req.sessionId = uuid();
                req.userAgent = userAgent;
                sessionId = req.sessionId;
            }
        }
        else {
            sessionId = uuid();
            res.setHeader("sessionid", sessionId);
            result = await waitCallback(_self.store, _self.store.set, sessionId, {});
            req.session = {};
            isNewSession = true;
        }
        res.on('finish', () => {
            if ((!req.session || Object.keys(req.session).length == 0) && req.sessionId) {
                waitCallback(_self.store, _self.store.destroy, sessionId);
            }
            else {
                waitCallback(_self.store, _self.store.set, sessionId, result);
            }
        });
        (req as any).sessionManager = _self;
        req.sessionId = sessionId;
        next();
    }
}