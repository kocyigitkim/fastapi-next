import { NextFunction, Request, Response } from "express";
import { ISessionStore } from "./ISessionStore";
import { IHealth } from "../health/IHealth";
import { NextHealthCheckStatus } from "../config/NextOptions";
export interface NextSessionIdResolver {
    (req: Request): Promise<string>;
}
export declare class NextSessionOptions {
    enableForwardedHeader?: boolean;
    enableIPCheck?: boolean;
    resolveSessionId?: NextSessionIdResolver;
    ttl?: number;
}
export declare class NextSessionBudget {
    id: string;
    data: any;
}
export declare class NextSessionManager implements IHealth {
    store: ISessionStore;
    options?: NextSessionOptions;
    constructor(store: ISessionStore, options?: NextSessionOptions);
    healthCheck(): Promise<NextHealthCheckStatus>;
    retrieveSession(sessionId: string): Promise<NextSessionBudget>;
    destroySession(sessionId: string): Promise<void>;
    setSession(sessionId: string, data: any): Promise<void>;
    use(req: Request & {
        session: any;
        sessionId: any;
        userAgent: any;
    }, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=NextSessionManager.d.ts.map