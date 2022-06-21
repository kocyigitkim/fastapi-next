import { NextHealthCheckStatus } from "../config/NextOptions";
import { IHealth } from "../health/IHealth";
export declare class ISessionStore implements IHealth {
    constructor();
    healthCheck(): Promise<NextHealthCheckStatus>;
    init(manager: any, cb?: () => void): void;
    get(sid: any, cb?: () => void): void;
    set(sid: any, sess: any, cb?: () => void): void;
    touch(sid: any, sess: any, cb?: () => void): void;
    destroy(sid: any, cb?: () => void): void;
    clear(cb?: () => void): void;
    length(cb?: () => void): void;
    ids(cb?: () => void): void;
    all(cb?: () => void): void;
    _getTTL(sess: any): void;
    _getAllKeys(cb?: () => void): void;
    _scanKeys(cb?: () => void): void;
}
//# sourceMappingURL=ISessionStore.d.ts.map