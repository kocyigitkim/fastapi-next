"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextWorkingDataFormat = exports.NextSwaggerOptions = exports.NextOpenApiOptions = exports.NextHealthCheckStatus = exports.NextHealthCheckOptions = exports.NextBodyParserOptions = exports.NextRenderingOptions = exports.NextJwtOptions = exports.NextSecurityOptions = exports.NextConfigurationOptions = exports.NextOptions = void 0;
const ConfigurationReader_1 = require("./ConfigurationReader");
class NextOptions {
    constructor() {
        this.debug = false;
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
        this.workingDataFormat = NextWorkingDataFormat.JSON;
        this.configuration = new NextConfigurationOptions();
    }
    addAuthMethod(method) {
        if (!this.authentication)
            this.authentication = new (require('../authentication/NextAuthentication').NextAuthentication)();
        this.authentication.add(method);
    }
}
exports.NextOptions = NextOptions;
class NextConfigurationOptions {
    constructor() {
        this.sourceType = ConfigurationReader_1.ConfigurationSourceType.FILE;
    }
}
exports.NextConfigurationOptions = NextConfigurationOptions;
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
        this.https = false;
        this.http = true;
        /**
         * Default tags for grouping endpoints
         * Each tag should have a name and description
         */
        this.tags = [];
        /**
         * Configure servers list in OpenAPI docs
         * Allows for additional environments (staging, production, etc)
         */
        this.additionalServers = [];
        /**
         * Set to true to sort endpoints by path
         */
        this.sortEndpoints = false;
        /**
         * Set to true to organize endpoints by tag instead of path
         */
        this.organizeByTags = true;
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
        /**
         * Enable Swagger UI dark mode
         */
        this.darkMode = true;
        /**
         * Enable filtering of operations
         */
        this.filter = true;
        /**
         * Configure default models expansion depth (0-10)
         * -1: everything is expanded
         * 0: no expansion
         * n: expand n levels
         */
        this.defaultModelsExpandDepth = 1;
        /**
         * Controls expansion of operation details
         * This does not affect the expansion of models
         */
        this.defaultModelExpandDepth = 1;
        /**
         * Display operationId in the operations list
         */
        this.displayOperationId = false;
        /**
         * Controls the display of extensions (x-) fields and values
         */
        this.showExtensions = false;
        /**
         * Controls how models are shown when model is clicked
         * 'model': show model only
         * 'example': show example only
         * 'schema': show schema only
         * 'model-example': show model and example
         */
        this.defaultModelRendering = 'model';
        /**
         * Enable syntax highlighting for code examples
         */
        this.syntaxHighlight = true;
        /**
         * Show request headers in curl examples
         */
        this.showRequestHeaders = true;
        /**
         * Controls the display of vendor extensions (x-)
         */
        this.showCommonExtensions = true;
        /**
         * The default expansion depth for the JSON documentation
         */
        this.docExpansion = 'list';
        /**
         * Maximum displayed tags
         */
        this.maxDisplayedTags = null;
        /**
         * Display the request duration (in milliseconds)
         */
        this.displayRequestDuration = true;
    }
}
exports.NextSwaggerOptions = NextSwaggerOptions;
var NextWorkingDataFormat;
(function (NextWorkingDataFormat) {
    NextWorkingDataFormat["JSON"] = "json";
    NextWorkingDataFormat["YAML"] = "yaml";
})(NextWorkingDataFormat || (exports.NextWorkingDataFormat = NextWorkingDataFormat = {}));
