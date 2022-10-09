"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextHealthCheckStatus = exports.NextHealthCheckOptions = exports.NextBodyParserOptions = exports.NextOptions = void 0;
class NextOptions {
    constructor() {
        this.debug = false;
        this.port = 5000;
        this.routerDirs = [];
        this.cors = null;
        this.authorization = null;
        this.authentication = null;
        this.sockets = null;
        this.socketRouterDirs = [];
    }
}
exports.NextOptions = NextOptions;
class NextBodyParserOptions {
}
exports.NextBodyParserOptions = NextBodyParserOptions;
class NextHealthCheckOptions {
    constructor() {
        this.livenessPath = "/health/check";
        this.readinessPath = "/health/ready";
    }
}
exports.NextHealthCheckOptions = NextHealthCheckOptions;
class NextHealthCheckStatus {
    constructor(success, message) {
        this.success = success;
        this.message = message;
    }
    static Dead() {
        return new NextHealthCheckStatus(false, "Dead");
    }
    static Alive() {
        return new NextHealthCheckStatus(true, "Alive");
    }
}
exports.NextHealthCheckStatus = NextHealthCheckStatus;
