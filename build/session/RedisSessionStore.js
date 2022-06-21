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
        this.handleError = this.handleError.bind(this);
        var client = (0, redis_1.createClient)(config);
        client.on('error', (err) => {
            this.handleError(err);
        });
        this.client = client;
    }
    handleError(err) {
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
            this.handleError(err);
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
            this.handleError(err);
        });
    }
    touch(sid, sess, cb) {
        this.client.expire(sid, this.ttl).then((result) => {
            if (cb)
                cb(null, this);
        }).catch((err) => {
            if (cb)
                cb(err);
            this.handleError(err);
        });
    }
    destroy(sid, cb) {
        this.client.del(sid).then((result) => {
            if (cb)
                cb(null, this);
        }).catch((err) => {
            if (cb)
                cb(err);
            this.handleError(err);
        });
    }
}
exports.RedisSessionStore = RedisSessionStore;
