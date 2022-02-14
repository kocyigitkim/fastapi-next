import { NextFunction, Request, Response } from "express";
import { ISessionStore } from "./ISessionStore";
export interface NextSessionIdResolver {
    (req: Request): Promise<string>;
}
export declare class NextSessionOptions {
    enableForwardedHeader?: boolean;
    enableIPCheck?: boolean;
    resolveSessionId?: NextSessionIdResolver;
}
export declare class NextSessionManager {
    store: ISessionStore;
    options?: NextSessionOptions;
    constructor(store: ISessionStore, options?: NextSessionOptions);
    use(req: Request & {
        session: any;
        sessionId: any;
        userAgent: any;
    }, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=NextSessionManager.d.ts.map