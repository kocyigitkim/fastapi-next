export class NextSession{
    public id: string;
    public data: Object;
    public ip: string;
    public userAgent: string;
    public createdAt: Date;
}
export class NextSessionProvider{
    public async getSession(sessionId: string): Promise<NextSession>{
        throw new Error("Method not implemented.");
    }
    public async createSession(sessionId: string): Promise<NextSession>{
        throw new Error("Method not implemented.");
    }
    public async updateSession(session: NextSession): Promise<NextSession>{
        throw new Error("Method not implemented.");
    }
    public async deleteSession(sessionId: string): Promise<NextSession>{
        throw new Error("Method not implemented.");
    }
}
export class NextInMemoryProvider extends NextSessionProvider{
    private sessions: Map<string, NextSession>;
    constructor(){
        super();
        this.sessions = new Map<string, NextSession>();
    }
    public async getSession(sessionId: string): Promise<NextSession>{
        return this.sessions.get(sessionId);
    }
    public async createSession(sessionId: string): Promise<NextSession>{
        let session = new NextSession();
        session.id = sessionId;
        session.data = {};
        this.sessions.set(sessionId, session);
        return session;
    }
    public async updateSession(session: NextSession): Promise<NextSession>{
        this.sessions.set(session.id, session);
        return session;
    }
    public async deleteSession(sessionId: string): Promise<NextSession>{
        this.sessions.delete(sessionId);
        return null;
    }
}
export class NextSessionManager{
    constructor(provider?: NextSessionProvider){
        if(!provider){
            provider = new NextInMemoryProvider();
        }
        this.provider = provider;
    }
    provider: NextSessionProvider;
    getSession(sessionId: string): Promise<NextSession>{
        return this.provider.getSession(sessionId);
    }
    createSession(sessionId: string): Promise<NextSession>{
        return this.provider.createSession(sessionId);
    }
    updateSession(session: NextSession): Promise<NextSession>{
        return this.provider.updateSession(session);
    }
    deleteSession(sessionId: string): Promise<NextSession>{
        return this.provider.deleteSession(sessionId);
    }

}