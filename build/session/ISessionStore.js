"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISessionStore = void 0;
const NextOptions_1 = require("../config/NextOptions");
const noop = () => { };
class ISessionStore {
    constructor() {
    }
    async healthCheck() { return NextOptions_1.NextHealthCheckStatus.Dead(); }
    init(manager, cb = noop) { }
    get(sid, cb = noop) { }
    set(sid, sess, cb = noop) { }
    touch(sid, sess, cb = noop) { }
    destroy(sid, cb = noop) { }
    clear(cb = noop) { }
    length(cb = noop) { }
    ids(cb = noop) { }
    all(cb = noop) { }
    _getTTL(sess) { }
    _getAllKeys(cb = noop) { }
    _scanKeys(cb = noop) { }
    _setTTL(sid, ttl, cb = noop) { }
}
exports.ISessionStore = ISessionStore;
