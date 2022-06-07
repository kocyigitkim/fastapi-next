"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisSessionStore = void 0;
const ISessionStore_1 = require("./ISessionStore");
const redis_1 = require("redis");
const noop = () => { };
class RedisSessionStore extends ISessionStore_1.ISessionStore {
    constructor(config, ttl = 30 * 60) {
        super();
        this.config = config;
        this.ttl = ttl;
        this.init = this.init.bind(this);
        var client = (0, redis_1.createClient)(config);
        client.on('error', (err) => {
            console.error(err);
            // ? automatically reconnect after a disconnect
            client.disconnect().finally(() => {
                client.connect();
            });
        });
        this.client = client;
    }
    get(sid, cb) {
        this.client.get(sid).then((result) => {
            try {
                if (cb)
                    cb(null, JSON.parse(result));
            }
            catch (err) {
                if (cb)
                    cb(err);
            }
        }).catch((err) => {
            if (cb)
                cb(err);
        });
    }
    set(sid, sess, cb) {
        this.client.set(sid, JSON.stringify(sess), {
            EX: this.ttl
        }).then((result) => {
            if (cb)
                cb(null, this);
        }).catch((err) => {
            if (cb)
                cb(err);
        });
    }
    touch(sid, sess, cb) {
        this.client.expire(sid, this.ttl).then((result) => {
            if (cb)
                cb(null, this);
        }).catch((err) => {
            if (cb)
                cb(err);
        });
    }
    destroy(sid, cb) {
        this.client.del(sid).then((result) => {
            if (cb)
                cb(null, this);
        }).catch((err) => {
            if (cb)
                cb(err);
        });
    }
}
exports.RedisSessionStore = RedisSessionStore;
