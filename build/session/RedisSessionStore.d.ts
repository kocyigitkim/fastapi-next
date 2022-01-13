import { ISessionStore } from "./ISessionStore";
export interface RedisOptions {
    host: string;
    password?: string;
    port?: number;
    ttl?: number;
}
export declare class RedisSessionStore extends ISessionStore {
    config: RedisOptions;
    store: any;
    constructor(config: RedisOptions);
}
//# sourceMappingURL=RedisSessionStore.d.ts.map