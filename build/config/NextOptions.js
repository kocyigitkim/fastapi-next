"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextSwaggerOptions = exports.NextOpenApiOptions = exports.NextHealthCheckStatus = exports.NextHealthCheckOptions = exports.NextBodyParserOptions = exports.NextRenderingOptions = exports.NextJwtOptions = exports.NextSecurityOptions = exports.NextOptions = void 0;
class NextOptions {
    constructor() {
        this.debug = false;
        this.port = 5000;
        this.routerDirs = [];
        this.cors = null;
        this.disableCorsMiddleware = false;
        this.authorization = null;
        this.authentication = null;
        this.sockets = null;
        this.socketRouterDirs = [];
        this.enableServices = false;
        this.security = new NextSecurityOptions();
        this.switchLoggerAsConsole = false;
        this.enableCookiesForSession = false;
        this.openApi = new NextOpenApiOptions();
        this.swagger = new NextSwaggerOptions();
        this.enableRealtimeConfig = false;
    }
    addAuthMethod(method) {
        if (!this.authentication)
            this.authentication = new (require('../authentication/NextAuthentication').NextAuthentication)();
        this.authentication.add(method);
    }
}
exports.NextOptions = NextOptions;
class NextSecurityOptions {
}
exports.NextSecurityOptions = NextSecurityOptions;
class NextJwtOptions {
    constructor() {
        this.algorithm = "HS256";
        this.secret = "secret";
        this.checkIfGranted = () => new Promise(resolve => resolve(true));
        this.verifyOptions = null;
        this.verifyPayload = (payload) => new Promise(resolve => resolve(payload));
        this.signOptions = null;
        this.createPayload = (req, app) => new Promise(resolve => resolve({}));
        this.messages = {
            unauthorized: "Unauthorized",
            invalidToken: "Invalid token"
        };
        this.refreshWhen = (payload) => new Promise(resolve => {
            var isTokenExpired = payload.exp && payload.exp < new Date().getTime();
            resolve(isTokenExpired);
        });
        this.resolveSessionId = (payload) => new Promise(resolve => resolve(payload.sessionId));
        this.refreshTokenWhenExpired = true;
        this.anonymousPaths = [];
    }
}
exports.NextJwtOptions = NextJwtOptions;
class NextRenderingOptions {
    constructor() {
        this.enabled = false;
    }
}
exports.NextRenderingOptions = NextRenderingOptions;
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
class NextOpenApiOptions {
    constructor() {
        this.path = "/openapi.json";
        this.enabled = true;
        this.title = "Fast Api";
        this.version = "1.0.0";
        this.description = "Fast Api - OpenApi Gateway";
        this.https = true;
        this.http = true;
    }
}
exports.NextOpenApiOptions = NextOpenApiOptions;
class NextSwaggerOptions {
    constructor() {
        this.path = "/swagger";
        this.enabled = true;
        this.customScript = null;
        this.customCss = null;
        this.customFavicon = null;
        this.customSiteTitle = null;
        this.customHeadContent = null;
    }
}
exports.NextSwaggerOptions = NextSwaggerOptions;
