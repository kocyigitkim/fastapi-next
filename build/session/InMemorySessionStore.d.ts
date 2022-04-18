import { ISessionStore } from "./ISessionStore";
export interface InMemorySessionConfig {
    ttl?: number;
}
export declare class InMemorySessionStore extends ISessionStore {
    store: any;
    config: InMemorySessionConfig;
    targetTTL: number;
    constructor(config: any);
    worker(): Promise<void>;
    get(id: any, callback: any): void;
    set(id: any, value: any, callback: any): void;
    destroy(id: any, callback: any): void;
    touch(id: any, value: any, callback: any): void;
}
//# sourceMappingURL=InMemorySessionStore.d.ts.map