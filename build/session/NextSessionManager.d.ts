import { NextFunction, Request, Response } from "express";
import { ISessionStore } from "./ISessionStore";
export declare class NextSessionOptions {
    enableForwardedHeader: boolean;
}
export declare class NextSessionManager {
    store: ISessionStore;
    constructor(store: ISessionStore);
    use(req: Request & {
        session: any;
        sessionId: any;
        userAgent: any;
    }, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=NextSessionManager.d.ts.map