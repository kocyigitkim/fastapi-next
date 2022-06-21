import { ISessionStore } from "./ISessionStore";
import redis, { RedisClientType } from 'redis';
import { RedisClientOptions } from '@redis/client';
export interface RedisOptions {
    host: string;
    password?: string;
    port?: number;
    ttl?: number;
}
export declare class RedisSessionStore extends ISessionStore {
    config: RedisClientOptions<any, any>;
    ttl: number;
    client: RedisClientType<any, any, redis.RedisScripts>;
    constructor(config: RedisClientOptions<any, any>, ttl?: number);
    private handleError;
    get(sid: any, cb?: any): void;
    set(sid: any, sess: any, cb?: any): void;
    touch(sid: any, sess: any, cb?: any): void;
    destroy(sid: any, cb?: any): void;
}
//# sourceMappingURL=RedisSessionStore.d.ts.map