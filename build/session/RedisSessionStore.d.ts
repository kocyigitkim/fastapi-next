import { ISessionStore } from "./ISessionStore";
import redis, { RedisClientOptions } from 'redis';
export interface RedisOptions {
    host: string;
    password?: string;
    port?: number;
    ttl?: number;
}
export declare class RedisSessionStore extends ISessionStore {
    config: RedisClientOptions<any, any>;
    ttl: number;
    client: redis.RedisClientType<any>;
    constructor(config: RedisClientOptions<any, any>, ttl?: number);
    get(sid: any, cb?: any): void;
    set(sid: any, sess: any, cb?: any): void;
    touch(sid: any, sess: any, cb?: any): void;
    destroy(sid: any, cb?: any): void;
}
//# sourceMappingURL=RedisSessionStore.d.ts.map