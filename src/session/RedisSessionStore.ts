import { ISessionStore } from "./ISessionStore";
import redis, { createClient, RedisClientType } from 'redis';
import { RedisClientOptions } from '@redis/client'

const noop = () => { };

export interface RedisOptions {
    host: string;
    password?: string;
    port?: number;
    ttl?: number;
}

export class RedisSessionStore extends ISessionStore {

    public client: RedisClientType<any, any, redis.RedisScripts>;
    constructor(public config: RedisClientOptions<any, any>, public ttl: number = 30 * 60) {
        super();
        this.init = this.init.bind(this);
        this.handleError = this.handleError.bind(this);
        var client = createClient(config);
        client.on('error', (err) => {
            this.handleError(err);
        });
        this.client = client;
    }
    private handleError(err: any) {
        const errorMessage = (err || "").toString();
        // if noauth error or no connection error, reconnect
        if (errorMessage.includes("NOAUTH") || errorMessage.includes("ECONNREFUSED")) {
            console.warn("Redis session store error:", errorMessage);
            console.log("Trying to reconnect...");
            this.client.disconnect().finally(() => {
                this.client.connect().then(() => {
                    console.log('Reconnected to Redis');
                }).catch((err) => {
                    console.error("Error reconnecting to Redis:", err);
                    setTimeout(this.handleError.bind(this, err), 1000);
                });
            });
        }
        else {
            console.error(err);
        }

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
            this.handleError(err);
        });
    }
    public set(sid: any, sess: any, cb?: any): void {
        this.client.set(sid, JSON.stringify(sess), {
            EX: this.ttl
        }).then((result) => {
            if (cb) cb(null, this);
        }).catch((err) => {
            if (cb) cb(err);
            this.handleError(err);
        });
    }
    public touch(sid: any, sess: any, cb?: any): void {
        this.client.expire(sid, this.ttl).then((result) => {
            if (cb) cb(null, this);
        }).catch((err) => {
            if (cb) cb(err);
            this.handleError(err);
        });
    }
    public destroy(sid: any, cb?: any): void {
        this.client.del(sid).then((result) => {
            if (cb) cb(null, this);
        }).catch((err) => {
            if (cb) cb(err);
            this.handleError(err);
        });
    }
}
