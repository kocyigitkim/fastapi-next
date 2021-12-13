import { NextFunction, Request, Response } from 'express';
export declare class NextContext {
    req: Request;
    res: Response;
    next: NextFunction;
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
    session: Object;
    sessionId: string;
    constructor(req: Request, res: Response, next: NextFunction);
}
//# sourceMappingURL=NextContext.d.ts.map