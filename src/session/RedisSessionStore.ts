import { ISessionStore } from "./ISessionStore";
import connectRedis from 'connect-redis';
import redis, { RedisClientOptions, createClient } from 'redis';
const noop = () => { };

export interface RedisOptions {
    host: string;
    password?: string;
    port?: number;
    ttl?: number;
}

export class RedisSessionStore extends ISessionStore {

    public client: redis.RedisClientType<any>;
    constructor(public config: RedisClientOptions<any, any>, public ttl: number = 30 * 60) {
        super();
        this.init = this.init.bind(this);
        var client = createClient(config);
        client.on('error', console.error);
        this.client = client;
    }
    public get(sid: any, cb?: any): void {
        this.client.get(sid).then((result) => {
            try {
                if (cb) cb(null, JSON.parse(result));
            } catch (err) {
                if (cb) cb(err);
            }
        }).catch((err) => {
            if (cb) cb(err);
        });
    }
    public set(sid: any, sess: any, cb?: any): void {
        this.client.set(sid, JSON.stringify(sess), {
            EX: this.ttl
        }).then((result) => {
            if (cb) cb(null, this);
        }).catch((err) => {
            if (cb) cb(err);
        });
    }
    public touch(sid: any, sess: any, cb?: any): void {
        this.client.expire(sid, this.ttl).then((result) => {
            if (cb) cb(null, this);
        }).catch((err) => {
            if (cb) cb(err);
        });
    }
    public destroy(sid: any, cb?: any): void {
        this.client.del(sid).then((result) => {
            if (cb) cb(null, this);
        }).catch((err) => {
            if (cb) cb(err);
        });
    }
}
