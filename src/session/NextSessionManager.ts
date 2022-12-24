import { NextFunction, Request, Response } from "express";
import { InMemorySessionStore } from "..";
import { ISessionStore } from "./ISessionStore";

import { v4 as uuid } from 'uuid';
import { checkIfValidIPV6, formatIP, isInternalIPAddress, waitCallback } from '../utils';
import { randomUUID } from "crypto";
import { IHealth } from "../health/IHealth";
import { NextHealthCheckStatus } from "../config/NextOptions";

export interface NextSessionIdResolver {
    (req: Request): Promise<string>;
}
export class NextSessionOptions {
    public enableForwardedHeader?: boolean = true;
    public enableIPCheck?: boolean = true;
    public resolveSessionId?: NextSessionIdResolver = null;
    public ttl?: number;
    public enableCookie?: boolean = false;
}

export class NextSessionBudget {
    public id: string;
    public data: any;
}
export class NextSessionManager implements IHealth {
    constructor(public store: ISessionStore, public options?: NextSessionOptions) {
        if (!this.store) this.store = new InMemorySessionStore({});
        if (!this.options) {
            this.options = new NextSessionOptions();
        }
        this.use = this.use.bind(this);
    }
    async healthCheck(): Promise<NextHealthCheckStatus> {
        return await this.store.healthCheck();
    }

    async retrieveSession(sessionId: string): Promise<NextSessionBudget> {
        if (sessionId) {
            await new Promise((resolve) => {
                try {
                    this.store.touch(sessionId, {}, () => resolve(null));
                } catch (err) {
                    resolve(null);
                }
            }
            ).catch(console.error);
            var result: any = (await waitCallback(this.store, this.store.get, sessionId));
            if (result) {
                return { id: sessionId, data: result && result.session };
            }

        }

        var newSession = {
            id: randomUUID(),
            data: {}
        };
        await waitCallback(this.store, this.store.set, newSession.id, {
            session: newSession.data
        });
        return newSession;
    }

    async destroySession(sessionId: string): Promise<void> {
        if (sessionId) {
            await waitCallback(this.store, this.store.destroy, sessionId);
        }
    }

    async setSession(sessionId: string, data: any): Promise<void> {
        if (sessionId) {
            await waitCallback(this.store, this.store.set, sessionId, {
                session: data
            });
        }
    }

    async setSessionTTL(sessionId: string, ttl: number) {
        if (sessionId) {
            await waitCallback(this.store, this.store._setTTL, sessionId, ttl);
        }
    }


    async use(req: Request & { session: any, sessionId: any, userAgent: any, sessionManager: any }, res: Response, next: NextFunction) {
        const _self = this;
        const isCookieEnabled = this.options.enableCookie;
        var sessionId = this.options.resolveSessionId ? await this.options.resolveSessionId(req) : req.header("sessionid");
        if (!sessionId && isCookieEnabled) {
            sessionId = req.cookies["sessionid"];
        }
        var forwardedIP = req.header("x-envoy-external-address") || (req.header("x-forwarded-for") || req.header("x-request-client-ip") || req.header("x-client-ip"));
        var ip = formatIP(req.socket.remoteAddress);
        if (forwardedIP) ip = formatIP(forwardedIP);
        var isV6 = checkIfValidIPV6(ip);
        var userAgent = req.headers['user-agent'];
        var isSessionIdExists = sessionId ? true : false;
        (req as any).clientIp = ip;
        if (sessionId) {
            try {
                await new Promise((resolve) => (_self.store.touch(sessionId, req.session, () => resolve(null))));
            } catch (err) { console.error(err); }
            var result: any = (await waitCallback(_self.store, _self.store.get, sessionId));
            if (!result) {
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
        }
        res.on('finish', () => {
            if ((!req.session || Object.keys(req.session).length == 0) && req.sessionId) {
                waitCallback(_self.store, _self.store.destroy, sessionId);
            }
            else {
                waitCallback(_self.store, _self.store.set, sessionId, result);
            }
        });
        if (isCookieEnabled && !isSessionIdExists) {
            res.cookie("sessionid", sessionId, { httpOnly: true, secure: true, sameSite: "strict" });
        }
        (req as any).sessionManager = _self;
        req.sessionId = sessionId;
        req.sessionManager = _self;
        next();
    }
}