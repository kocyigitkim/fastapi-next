import { NextFunction, Request, Response } from 'express'

import { NextApplication } from './NextApplication';
import { NextSessionManager } from './session/NextSessionManager';
import { NextRouteAction } from './routing/NextRouteAction';

export interface INextContextBase {
    //#region Express Parameters
    req: Request;
    res: Response;
    next: NextFunction;
    //#endregion

    //#region Request Parameters
    body: any;
    query: any;
    params: any;
    cookies: any;
    headers: any;
    protocol: string;
    ip: string;
    ipv4: boolean;
    ipv6: boolean;
    method: string;
    url: string;
    path: string;
    files?: Array<Express.Multer.File>;
    fileCount?: number;
    //#endregion

    //#region Session Parameters
    session: Object;
    sessionId: string;
    sessionManager: NextSessionManager;
    //#endregion

    //#region Realtime Configuration
    config: any;
    //#endregion

    get token(): string | null;
}
export class NextContextBase implements INextContextBase {
    public app: NextApplication;
    public route: NextRouteAction;

    //#region Express Parameters
    public req: Request;
    public res: Response;
    public next: NextFunction;
    //#endregion

    //#region Request Parameters
    public all: any;
    public body: any;
    public query: any;
    public params: any;
    public cookies: any;
    public headers: any;
    public protocol: string;
    public ip: string;
    public ipv4: boolean;
    public ipv6: boolean;
    public method: string;
    public url: string;
    public path: string;
    public files?: Array<Express.Multer.File>;
    public fileCount?: number;
    //#endregion

    //#region Session Parameters
    public session: Object;
    public sessionId: string;
    public sessionManager: NextSessionManager;

    public items: Object;
    //#endregion

    //#region Realtime Configuration
    public config: any;
    //#endregion

    public get token(): string | null {
        return (this.req as any).token || (this.req as any).access_token || (this.req as any).accessToken || null;
    }

    constructor(req: Request, res: Response, next: NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;

        this.body = req.body;
        this.query = req.query;
        this.params = req.params;
        this.all = { ...req.params, ...req.query, ...req.body };
        this.cookies = req.cookies;
        this.headers = req.headers;
        this.protocol = req.protocol;
        this.files = (req as any).files;
        this.fileCount = (req as any).fileCount;
        this.ip = ((req as any).clientIp) || req.ip;
        this.ipv4 = ((req.ip || "").split(":")[0]) === req.ip;
        this.ipv6 = !this.ipv4;
        this.method = req.method;
        this.url = req.url;
        this.path = req.path;

        this.session = (req as any).session;
        this.sessionId = (this.session && (this.session as any).id) || (req as any).sessionId;
        if (req.query && req.query["callback_sid"]) {
            this.sessionId = req.query["callback_sid"] as any;
        }
        this.items = {};
    }
}

export type NextContext<TBODY, TQUERY = TBODY, TPARAMS = TBODY> = INextContextBase & NextContextBase & {
    body: TBODY;
    query: TQUERY;
    params: TPARAMS;
}
