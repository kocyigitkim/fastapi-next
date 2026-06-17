"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisSessionStore = void 0;
const ISessionStore_1 = require("./ISessionStore");
const redis_1 = require("redis");
const NextOptions_1 = require("../config/NextOptions");
const REDIS_OP_TIMEOUT_MS = 2000;
const DEFAULT_IDLE_MS = 600000; // 10 dakika
const DEFAULT_MAX_KEYS = 100000;
const EVICTION_INTERVAL_MS = 60000; // her 1 dakikada idle evict
function withTimeout(promise) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('redis operation timeout')), REDIS_OP_TIMEOUT_MS)),
    ]);
}
class RedisSessionStore extends ISessionStore_1.ISessionStore {
    constructor(config, ttl = 30 * 60, hotCache = {}) {
        var _a, _b;
        super();
        this.config = config;
        this.ttl = ttl;
        this.isAlive = false;
        // ─── hot cache ───────────────────────────────────────────────────────────
        this.mem = new Map();
        this.memIdleMs = (_a = hotCache.idleMs) !== null && _a !== void 0 ? _a : DEFAULT_IDLE_MS;
        this.maxMemoryKeys = (_b = hotCache.maxKeys) !== null && _b !== void 0 ? _b : DEFAULT_MAX_KEYS;
        this.init = this.init.bind(this);
        this.handleError = this.handleError.bind(this);
        var client = (0, redis_1.createClient)(Object.assign(Object.assign({}, config), { socket: Object.assign({ keepAlive: 30000, reconnectStrategy: (retries) => Math.min(retries * 100, 3000), connectTimeout: 10000 }, config.socket) }));
        client.on('error', (err) => { this.handleError(err); });
        client.on('connect', () => { this.isAlive = true; });
        client.on('reconnecting', () => { this.isAlive = false; });
        this.client = client;
        this._startEvictionWorker();
    }
    // ─── health ──────────────────────────────────────────────────────────────
    async healthCheck() {
        // hot cache sayesinde her zaman alive
        return NextOptions_1.NextHealthCheckStatus.Alive();
    }
    handleError(err) {
        const msg = (err || "").toString().toLowerCase();
        const isConnectivity = msg.includes("noauth")
            || msg.includes("econnrefused")
            || msg.includes("closed")
            || msg.includes("socket");
        if (isConnectivity) {
            console.warn("Redis session store error:", msg);
            this.isAlive = false;
        }
        else {
            console.error(err);
        }
    }
    // ─── hot cache helpers ───────────────────────────────────────────────────
    memGet(sid) {
        const entry = this.mem.get(sid);
        if (!entry)
            return undefined;
        entry.lastAccess = Date.now();
        return entry.value;
    }
    memSet(sid, value) {
        if (!this.mem.has(sid) && this.mem.size >= this.maxMemoryKeys) {
            this._evictLRU();
        }
        this.mem.set(sid, { value, lastAccess: Date.now() });
    }
    memDelete(sid) {
        this.mem.delete(sid);
    }
    _evictLRU() {
        const count = Math.ceil(this.maxMemoryKeys * 0.1);
        const sorted = [...this.mem.entries()].sort((a, b) => a[1].lastAccess - b[1].lastAccess);
        for (let i = 0; i < count && i < sorted.length; i++) {
            this.mem.delete(sorted[i][0]);
        }
    }
    _evictIdle() {
        const threshold = Date.now() - this.memIdleMs;
        for (const [sid, entry] of this.mem) {
            if (entry.lastAccess < threshold)
                this.mem.delete(sid);
        }
    }
    _startEvictionWorker() {
        const tick = () => {
            this._evictIdle();
            setTimeout(tick, EVICTION_INTERVAL_MS);
        };
        setTimeout(tick, EVICTION_INTERVAL_MS);
    }
    /** Kaç session bellekte tutuluyor (monitoring için) */
    get memorySize() { return this.mem.size; }
    // ─── ISessionStore ───────────────────────────────────────────────────────
    get(sid, cb) {
        if (this.isAlive) {
            withTimeout(this.client.get(sid))
                .then((result) => {
                if (result !== null && result !== undefined) {
                    try {
                        const parsed = JSON.parse(result);
                        this.memSet(sid, parsed); // her Redis okumasında memory'i güncelle
                        if (cb)
                            cb(null, parsed);
                    }
                    catch (err) {
                        if (cb)
                            cb(err);
                    }
                }
                else {
                    // Redis'te yok → memory fallback
                    const cached = this.memGet(sid);
                    if (cached !== undefined) {
                        if (cb)
                            cb(null, cached);
                    }
                    else {
                        if (cb)
                            cb(null, null);
                    }
                }
                this.isAlive = true;
            })
                .catch((err) => {
                // Redis timeout/hata → memory fallback
                const cached = this.memGet(sid);
                if (cached !== undefined) {
                    if (cb)
                        cb(null, cached);
                }
                else {
                    if (cb)
                        cb(err);
                }
                this.handleError(err);
            });
        }
        else {
            // Redis down → memory fallback
            const cached = this.memGet(sid);
            if (cached !== undefined) {
                if (cb)
                    cb(null, cached);
            }
            else {
                if (cb)
                    cb("Redis unavailable, no hot cache for session", null);
            }
        }
    }
    set(sid, sess, cb) {
        // Her zaman memory'e yaz
        this.memSet(sid, sess);
        if (this.isAlive) {
            withTimeout(this.client.set(sid, JSON.stringify(sess), { EX: this.ttl }))
                .then(() => {
                if (cb)
                    cb(null, sess);
                this.isAlive = true;
            })
                .catch((err) => {
                // memory'e yazdık, Redis fail → hata döndürme
                if (cb)
                    cb(null, sess);
                this.handleError(err);
            });
        }
        else {
            if (cb)
                cb(null, sess);
        }
    }
    touch(sid, sess, cb) {
        const entry = this.mem.get(sid);
        if (entry)
            entry.lastAccess = Date.now();
        if (this.isAlive) {
            withTimeout(this.client.expire(sid, this.ttl))
                .then(() => {
                if (cb)
                    cb(null, this);
                this.isAlive = true;
            })
                .catch((err) => {
                if (cb)
                    cb(null, this); // memory'de var, devam et
                this.handleError(err);
            });
        }
        else {
            if (cb)
                cb(null, this);
        }
    }
    _setTTL(sid, ttl, cb) {
        if (this.isAlive) {
            withTimeout(this.client.expire(sid, ttl))
                .then(() => {
                if (cb)
                    cb();
                this.isAlive = true;
            })
                .catch((err) => {
                if (cb)
                    cb();
                this.handleError(err);
            });
        }
        else {
            if (cb)
                cb();
        }
    }
    destroy(sid, cb) {
        this.memDelete(sid);
        if (this.isAlive) {
            withTimeout(this.client.del(sid))
                .then(() => {
                if (cb)
                    cb(null, this);
                this.isAlive = true;
            })
                .catch((err) => {
                if (cb)
                    cb(null, this);
                this.handleError(err);
            });
        }
        else {
            if (cb)
                cb(null, this);
        }
    }
}
exports.RedisSessionStore = RedisSessionStore;
