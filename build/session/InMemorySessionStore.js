"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySessionStore = void 0;
const NextOptions_1 = require("../config/NextOptions");
const ISessionStore_1 = require("./ISessionStore");
class InMemorySessionStore extends ISessionStore_1.ISessionStore {
    constructor(config) {
        super();
        this.config = Object.assign({ ttl: 1000 * 30 * 60 }, config);
        this.store = {};
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
        this.destroy = this.destroy.bind(this);
        this.worker = this.worker.call(this);
        this.targetTTL = this.config.ttl;
    }
    ;
    async healthCheck() {
        return NextOptions_1.NextHealthCheckStatus.Alive();
    }
    async worker() {
        const _self = this;
        while (true) {
            var now = new Date();
            for (var k in this.store) {
                var v = this.store[k];
                if (!v.ttl || v.ttl < now) {
                    delete this.store[k];
                }
            }
            await new Promise((resolve) => {
                setTimeout(resolve, _self.targetTTL);
            });
        }
    }
    get(id, callback) {
        var v = this.store[id];
        if (v && v.value) {
            if (callback)
                callback(null, v.value);
        }
        else {
            if (callback)
                callback("Session not exists", v);
        }
    }
    set(id, value, callback) {
        this.store[id] = { value: value, ttl: new Date(new Date().valueOf() + this.targetTTL + 1000) };
        if (callback)
            callback(null, this);
    }
    destroy(id, callback) {
        var v = this.store[id];
        if (v && v.value) {
            delete this.store[id];
            if (callback)
                callback(null, v.value);
        }
        else {
            if (callback)
                callback("Session not exists", v);
        }
    }
    touch(id, value, callback) {
        var v = this.store[id];
        if (v && v.value) {
            v.ttl = new Date(new Date().valueOf() + this.targetTTL + 1000);
            if (callback)
                callback(null, v.value);
        }
        else {
            if (callback)
                callback("Session not exists", v);
        }
    }
    _setTTL(sid, ttl, cb) {
        var v = this.store[sid];
        if (v && v.value) {
            v.ttl = new Date(new Date().valueOf() + ttl + 1000);
            if (cb)
                cb();
        }
        else {
            if (cb)
                cb();
        }
    }
}
exports.InMemorySessionStore = InMemorySessionStore;
