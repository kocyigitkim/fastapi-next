"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextConsoleLog = exports.NextLog = void 0;
class NextLog {
    log(message) { }
    error(message) { }
    warn(message) { }
    info(message) { this.log(message); }
    debug(message) { this.log(message); }
    trace(message) { this.log(message); }
}
exports.NextLog = NextLog;
class NextConsoleLog extends NextLog {
    log(message) { console.log(message); }
    error(message) { console.error(message); }
    warn(message) { console.warn(message); }
}
exports.NextConsoleLog = NextConsoleLog;
