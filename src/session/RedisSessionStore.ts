import { ISessionStore } from "./ISessionStore";
import connectRedis from 'connect-redis';
import redis, { RedisClientOptions } from 'redis';
const noop = () => { };

export interface RedisOptions {
    host: string;
    password?: string;
    port?: number;
    ttl?: number;
}

export class RedisSessionStore extends ISessionStore {
    public store: any;
    constructor(public config: RedisOptions) {
        super();
        var redisStore = connectRedis({ Store: ISessionStore } as any);
        this.init = this.init.bind(this);
        var store = new redisStore({ client: redis.createClient(config) as any });
        this.store = store;
    }
}
