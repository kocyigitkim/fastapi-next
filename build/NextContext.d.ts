/// <reference types="multer" />
import { NextFunction, Request, Response } from 'express';
import { NextApplication } from './NextApplication';
import { NextSessionManager } from './session/NextSessionManager';
export interface INextContextBase {
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
    files?: Array<Express.Multer.File>;
    fileCount?: number;
    session: Object;
    sessionId: string;
    sessionManager: NextSessionManager;
    get token(): string | null;
}
export declare class NextContextBase implements INextContextBase {
    app: NextApplication;
    req: Request;
    res: Response;
    next: NextFunction;
    all: any;
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
    session: Object;
    sessionId: string;
    sessionManager: NextSessionManager;
    items: Object;
    get token(): string | null;
    constructor(req: Request, res: Response, next: NextFunction);
}
export declare type NextContext<TBODY, TQUERY = TBODY, TPARAMS = TBODY> = INextContextBase & NextContextBase & {
    body: TBODY;
    query: TQUERY;
    params: TPARAMS;
};
//# sourceMappingURL=NextContext.d.ts.map