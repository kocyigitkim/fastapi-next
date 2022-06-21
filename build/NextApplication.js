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
const FileSystemSessionStore_1 = require("./session/FileSystemSessionStore");
const NextSocket_1 = require("./sockets/NextSocket");
const NextSocketRouter_1 = require("./sockets/NextSocketRouter");
const NextHealthProfiler_1 = require("./health/NextHealthProfiler");
class NextApplication extends events_1.default {
    constructor(options) {
        super();
        this.options = options;
        this.express = (0, express_1.default)();
        // ? Default Express Plugins
        if (options.cors)
            this.express.use((0, cors_1.default)(options.cors));
        else
            this.express.use((0, cors_1.default)({
                origin: '*',
                methods: '*',
                allowedHeaders: '*',
                preflightContinue: true
            }));
        this.express.use(express_1.default.json(Object.assign({ type: 'application/json' }, ((options.bodyParser && options.bodyParser.json) || {}))));
        this.express.use(express_1.default.urlencoded(Object.assign({ type: 'application/x-www-form-urlencoded' }, ((options.bodyParser && options.bodyParser.urlencoded) || {}))));
        this.registry = new NextRegistry_1.NextRegistry(this);
        this.log = new NextLog_1.NextConsoleLog();
        this.profiler = new NextProfiler_1.NextProfiler(this, new NextProfiler_1.NextProfilerOptions(options.debug));
    }
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
    async registerFileSystemSession(rootPath, options) {
        this.express.use((this.sessionManager = new _1.NextSessionManager(new FileSystemSessionStore_1.FileSystemSessionStore(rootPath, options && options.ttl), options)).use);
    }
    async registerInMemorySession(options) {
        this.express.use((this.sessionManager = new _1.NextSessionManager(null, options)).use);
    }
    async registerRedisSession(config, ttl = 30 * 60, options) {
        var session = new RedisSessionStore_1.RedisSessionStore(config, ttl || options.ttl);
        await session.client.connect();
        this.express.use((this.sessionManager = new _1.NextSessionManager(session, options)).use);
        this.registerHealthCheck("sessionManager", this.sessionManager);
    }
    async init() {
        (0, NextInitializationHeader_1.NextInitializationHeader)();
        this.emit('preinit', this);
        for (var plugin of this.registry.getPlugins()) {
            await plugin.init(this);
        }
        this.routeBuilder = new NextRouteBuilder_1.NextRouteBuilder(this);
        if (this.options.sockets) {
            this.socket = new NextSocket_1.NextSocket(this.options.sockets, this);
            this.socketRouter = new NextSocketRouter_1.NextSocketRouter();
            this.socket.router = this.socketRouter;
            this.socketRouter.registerRouters(this.options.socketRouterDirs);
        }
        this.emit('init', this);
    }
    async start() {
        (0, NextInitializationHeader_1.NextRunning)();
        this.server = this.express.listen(this.options.port, () => {
            this.log.info(`Server listening on port ${this.options.port}`);
        });
        this.emit('start', this);
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
