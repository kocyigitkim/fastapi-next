"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISessionStore = void 0;
const events_1 = require("events");
const noop = () => { };
class ISessionStore {
    constructor() {
        events_1.EventEmitter.call(this);
    }
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
}
exports.ISessionStore = ISessionStore;
