const noop = () => { };

export class ISessionStore {
    constructor() {

    }
    public init(manager, cb = noop) { }
    public get(sid, cb = noop) { }
    public set(sid, sess, cb = noop) { }
    public touch(sid, sess, cb = noop) { }
    public destroy(sid, cb = noop) { }
    public clear(cb = noop) { }
    public length(cb = noop) { }
    public ids(cb = noop) { }
    public all(cb = noop) { }
    public _getTTL(sess) { }
    public _getAllKeys(cb = noop) { }
    public _scanKeys(cb = noop) { }
}