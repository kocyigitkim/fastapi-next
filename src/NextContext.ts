import { NextFunction, Request, Response } from 'express'
export class NextContext {
    //#region Express Parameters
    public req: Request;
    public res: Response;
    public next: NextFunction;
    //#endregion

    //#region Request Parameters
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
    //#endregion

    //#region Session Parameters
    public session: Object;
    public sessionId: string;
    //#endregion

    constructor(req: Request, res: Response, next: NextFunction) {
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

        this.session = (req as any).session;
        this.sessionId = (req as any).sessionId;
    }
}