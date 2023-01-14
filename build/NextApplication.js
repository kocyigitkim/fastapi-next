"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextApplication = void 0;
const events_1 = __importDefault(require("events"));
const express_1 = __importDefault(require("express"));
const NextOptions_1 = require("./config/NextOptions");
const NextInitializationHeader_1 = require("./NextInitializationHeader");
const NextLog_1 = require("./NextLog");
const NextProfiler_1 = require("./NextProfiler");
const NextRegistry_1 = require("./NextRegistry");
const NextRouteBuilder_1 = require("./routing/NextRouteBuilder");
const cors_1 = __importDefault(require("cors"));
const _1 = require(".");
const RedisSessionStore_1 = require("./session/RedisSessionStore");
const NextSessionManager_1 = require("./session/NextSessionManager");
const FileSystemSessionStore_1 = require("./session/FileSystemSessionStore");
const NextSocket_1 = require("./sockets/NextSocket");
const NextSocketRouter_1 = require("./sockets/NextSocketRouter");
const NextHealthProfiler_1 = require("./health/NextHealthProfiler");
const NextRealtimeFunctions_1 = require("./sockets/NextRealtimeFunctions");
const JWTController_1 = require("./security/JWT/JWTController");
const NextClientBuilder_1 = require("./client/NextClientBuilder");
const Logger_1 = require("./logs/Logger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const NextUrlBuilder_1 = require("./structure/NextUrlBuilder");
const NextOpenApiBuilder_1 = require("./client/NextOpenApiBuilder");
const ConfigurationReader_1 = require("./config/ConfigurationReader");
class NextApplication extends events_1.default {
    on(eventName, listener) {
        super.on(eventName, listener);
        return this;
    }
    enableHealthCheck() {
        this.healthProfiler = new NextHealthProfiler_1.NextHealthProfiler();
        this.options.healthCheck = new NextOptions_1.NextHealthCheckOptions();
    }
    registerHealthCheck(name, obj) {
        this.healthProfiler.register(name, obj);
    }
    constructor(options) {
        super();
        this.realtime = new NextRealtimeFunctions_1.NextRealtimeFunctions(this);
        this.options = options || new NextOptions_1.NextOptions();
        this.express = (0, express_1.default)();
        // ? Default Express Plugins
        if (!options.disableCorsMiddleware) {
            if (options.cors)
                this.express.use((0, cors_1.default)(options.cors));
            else
                this.express.use((0, cors_1.default)({
                    origin: '*',
                    methods: '*',
                    allowedHeaders: '*',
                    preflightContinue: true
                }));
        }
        if (options.enableCookiesForSession) {
            this.express.use((0, cookie_parser_1.default)());
        }
        if (!this.options.port)
            this.options.port = 5000;
        if (process.env["NEXT_BASE_URL"]) {
            this.options.baseUrl = process.env["NEXT_BASE_URL"];
        }
        this.url = new NextUrlBuilder_1.NextUrlBuilder(this);
        this.express.use(express_1.default.json(Object.assign({ type: 'application/json' }, ((options.bodyParser && options.bodyParser.json) || {}))));
        this.express.use(express_1.default.urlencoded(Object.assign({ type: 'application/x-www-form-urlencoded' }, ((options.bodyParser && options.bodyParser.urlencoded) || {}))));
        this.registry = new NextRegistry_1.NextRegistry(this);
        this.log = new NextLog_1.NextConsoleLog();
        this.profiler = new NextProfiler_1.NextProfiler(this, new NextProfiler_1.NextProfilerOptions(options.debug));
        this.on('error', console.error);
        this.openapi = new NextOpenApiBuilder_1.NextOpenApiBuilder(this);
    }
    async registerFileSystemSession(rootPath, options) {
        if (this.options.enableCookiesForSession) {
            options = new NextSessionManager_1.NextSessionOptions();
            options.enableCookie = this.options.enableCookiesForSession;
        }
        this.express.use((this.sessionManager = new _1.NextSessionManager(new FileSystemSessionStore_1.FileSystemSessionStore(rootPath, options && options.ttl), options)).use);
    }
    async registerInMemorySession(options) {
        if (this.options.enableCookiesForSession) {
            options = new NextSessionManager_1.NextSessionOptions();
            options.enableCookie = this.options.enableCookiesForSession;
        }
        this.express.use((this.sessionManager = new _1.NextSessionManager(null, options)).use);
    }
    async registerRedisSession(config, ttl = 30 * 60, options) {
        if (this.options.enableCookiesForSession) {
            options = new NextSessionManager_1.NextSessionOptions();
            options.enableCookie = this.options.enableCookiesForSession;
        }
        var session = new RedisSessionStore_1.RedisSessionStore(config, ttl || options.ttl);
        await session.client.connect();
        this.express.use((this.sessionManager = new _1.NextSessionManager(session, options)).use);
        if (this.options.healthCheck)
            this.registerHealthCheck("sessionManager", this.sessionManager);
    }
    async registerSession(options, override) {
        var env = process.env;
        if (override)
            env = override;
        const sessionType = (env.SESSION_TYPE || 'inmemory').toLowerCase();
        if (sessionType === 'filesystem') {
            await this.registerFileSystemSession(env.SESSION_PATH || './sessions', options);
        }
        else if (sessionType === 'redis') {
            await this.registerRedisSession({
                url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
                password: env.REDIS_PASSWORD
            }, parseInt(env.REDIS_TTL || 3600), options);
        }
        else if (sessionType === 'inmemory') {
            await this.registerInMemorySession(options);
        }
        else {
            throw new Error(`Invalid session type ${sessionType}`);
        }
    }
    registerJWT(jwt) {
        this.options.security.jwt = jwt || new NextOptions_1.NextJwtOptions();
        // ? Register JWT Controller
        if (this.options.security.jwt) {
            this.jwtController = new JWTController_1.JWTController(this);
            this.jwtController.RegisterJWTController();
        }
    }
    async init() {
        (0, NextInitializationHeader_1.NextInitializationHeader)();
        this.emit('preinit', this);
        for (var plugin of this.registry.getPlugins()) {
            await plugin.init(this);
        }
        this.routeBuilder = new NextRouteBuilder_1.NextRouteBuilder(this);
        if (this.options.authentication) {
            console.log("Registering Authentication");
            this.options.authentication.register(this);
        }
        if (this.options.sockets) {
            this.socket = new NextSocket_1.NextSocket(this.options.sockets, this);
            this.socketRouter = new NextSocketRouter_1.NextSocketRouter();
            this.socket.router = this.socketRouter;
            this.socketRouter.registerRouters(this.options.socketRouterDirs);
        }
        this.emit('init', this);
        // ? Static file serving
        if (this.options.staticDir) {
            this.express.use(express_1.default.static(this.options.staticDir));
        }
        // ? Build Client Script
        new NextClientBuilder_1.NextClientBuilder(this).build();
        // ? Use OpenApi
        if (this.options.openApi && this.options.openApi.enabled) {
            this.openapi.use();
        }
        // ? Route not found
        this.express.use("*", (req, res, next) => {
            var _a, _b;
            if (((_a = req.method) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "get") {
                if (((_b = req.headers["content-type"]) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === "text/html") {
                    res.status(200);
                    res.header("Content-Type", "text/html");
                    res.send(this.options.routeNotFoundContent || "<h1>404 Not Found</h1>");
                    return;
                }
            }
            next();
        });
        // ? Realtime Configuration
        if (this.options.enableRealtimeConfig) {
            await ConfigurationReader_1.ConfigurationReader.init();
        }
    }
    async start() {
        (0, NextInitializationHeader_1.NextRunning)();
        this.server = this.express.listen(this.options.port, () => {
            this.log.info(`Server listening on port ${this.options.port}`);
        });
        this.emit('start', this);
        if (this.jwtController && this.options.security.jwt.refreshTokenWhenExpired) {
            this.jwtController.RegisterRefresh();
        }
        if (this.options.switchLoggerAsConsole) {
            console.log = Logger_1.Logger.log;
            console.error = Logger_1.Logger.error;
            console.warn = Logger_1.Logger.warn;
            console.info = Logger_1.Logger.info;
            console.debug = Logger_1.Logger.debug;
            console.trace = Logger_1.Logger.trace;
        }
    }
    async stop() {
        this.emit('stop', this);
    }
    async restart() {
        this.emit('restart', this);
        await this.stop();
        await this.start();
    }
    async destroy() {
        this.emit('destroy', this);
    }
}
exports.NextApplication = NextApplication;
