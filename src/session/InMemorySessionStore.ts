import { NextHealthCheckStatus } from "../config/NextOptions";
import { ISessionStore } from "./ISessionStore";

export interface InMemorySessionConfig {
    ttl?: number;
}
interface InMemoryStoredObject {
    ttl: Date;
    value: any;
}

export class InMemorySessionStore extends ISessionStore {
    public store: any;
    public config: InMemorySessionConfig;
    public targetTTL: number;;
    constructor(config) {
        super();
        this.config = { ttl: 1000 * 30 * 60, ...config };
        this.store = {};
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
        this.destroy = this.destroy.bind(this);
        this.worker = this.worker.call(this);
        this.targetTTL = this.config.ttl;
    }
    async healthCheck(): Promise<NextHealthCheckStatus> {
        return NextHealthCheckStatus.Alive();
    }
    async worker() {
        const _self = this;
        while (true) {
            var now = new Date();
            for (var k in this.store) {
                var v = this.store[k] as InMemoryStoredObject;
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
            if (callback) callback(null, v.value);
        }
        else {
            if (callback) callback("Session not exists", v);
        }
    }
    set(id, value, callback) {
        this.store[id] = { value: value, ttl: new Date(new Date().valueOf() + this.targetTTL + 1000) };
        if (callback) callback(null, this);
    }
    destroy(id, callback) {
        var v = this.store[id];
        if (v && v.value) {
            delete this.store[id];
            if (callback) callback(null, v.value);
        }
        else {
            if (callback) callback("Session not exists", v);
        }
    }
    touch(id, value, callback) {
        var v = this.store[id];
        if (v && v.value) {
            v.ttl = new Date(new Date().valueOf() + this.targetTTL + 1000);
            if (callback) callback(null, v.value);
        }
        else {
            if (callback) callback("Session not exists", v);
        }
    }
}

