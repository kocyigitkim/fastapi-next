"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextSessionManager = exports.NextInMemoryProvider = exports.NextSessionProvider = exports.NextSession = void 0;
class NextSession {
}
exports.NextSession = NextSession;
class NextSessionProvider {
    async getSession(sessionId) {
        throw new Error("Method not implemented.");
    }
    async createSession(sessionId) {
        throw new Error("Method not implemented.");
    }
    async updateSession(session) {
        throw new Error("Method not implemented.");
    }
    async deleteSession(sessionId) {
        throw new Error("Method not implemented.");
    }
}
exports.NextSessionProvider = NextSessionProvider;
class NextInMemoryProvider extends NextSessionProvider {
    constructor() {
        super();
        this.sessions = new Map();
    }
    async getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    async createSession(sessionId) {
        let session = new NextSession();
        session.id = sessionId;
        session.data = {};
        this.sessions.set(sessionId, session);
        return session;
    }
    async updateSession(session) {
        this.sessions.set(session.id, session);
        return session;
    }
    async deleteSession(sessionId) {
        this.sessions.delete(sessionId);
        return null;
    }
}
exports.NextInMemoryProvider = NextInMemoryProvider;
class NextSessionManager {
    constructor(provider) {
        if (!provider) {
            provider = new NextInMemoryProvider();
        }
        this.provider = provider;
    }
    getSession(sessionId) {
        return this.provider.getSession(sessionId);
    }
    createSession(sessionId) {
        return this.provider.createSession(sessionId);
    }
    updateSession(session) {
        return this.provider.updateSession(session);
    }
    deleteSession(sessionId) {
        return this.provider.deleteSession(sessionId);
    }
}
exports.NextSessionManager = NextSessionManager;
