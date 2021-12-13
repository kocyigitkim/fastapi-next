export declare class NextSession {
    id: string;
    data: Object;
    ip: string;
    userAgent: string;
    createdAt: Date;
}
export declare class NextSessionProvider {
    getSession(sessionId: string): Promise<NextSession>;
    createSession(sessionId: string): Promise<NextSession>;
    updateSession(session: NextSession): Promise<NextSession>;
    deleteSession(sessionId: string): Promise<NextSession>;
}
export declare class NextInMemoryProvider extends NextSessionProvider {
    private sessions;
    constructor();
    getSession(sessionId: string): Promise<NextSession>;
    createSession(sessionId: string): Promise<NextSession>;
    updateSession(session: NextSession): Promise<NextSession>;
    deleteSession(sessionId: string): Promise<NextSession>;
}
export declare class NextSessionManager {
    constructor(provider?: NextSessionProvider);
    provider: NextSessionProvider;
    getSession(sessionId: string): Promise<NextSession>;
    createSession(sessionId: string): Promise<NextSession>;
    updateSession(session: NextSession): Promise<NextSession>;
    deleteSession(sessionId: string): Promise<NextSession>;
}
//# sourceMappingURL=NextSessionManager.d.ts.map