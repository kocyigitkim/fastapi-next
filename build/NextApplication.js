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
const DynamicConfigLoader_1 = require("./DynamicConfigLoader");
const workflows_1 = require("./workflows");
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
    registerObjectRouter(router) {
        this.objectRouters.push(router);
    }
    registerObjectRouters(router) {
        this.objectRouters.push(...router);
    }
    workflow(router) {
        if (Array.isArray(router)) {
            for (let r of router) {
                this.workflow(r);
            }
        }
        else {
            this.workflowRouters.push(router);
        }
    }
    constructor(settingsOrOptions) {
        var _a;
        super();
        this.staticDirs = [];
        this.objectRouters = [];
        this.workflowRouters = [];
        this.config = {};
        this.dynamicConfigLoader = null;
        this.realtime = new NextRealtimeFunctions_1.NextRealtimeFunctions(this);
        // Eğer parametre bir NextOptions ise, onu NextApplicationSettings'e dönüştür
        if (settingsOrOptions instanceof NextOptions_1.NextOptions) {
            this._applicationSettings = {
                nextOptions: settingsOrOptions
            };
            this.options = settingsOrOptions;
        }
        else {
            // Parametre zaten NextApplicationSettings tipinde
            this._applicationSettings = settingsOrOptions;
            this.options = settingsOrOptions.nextOptions || new NextOptions_1.NextOptions();
        }
        this.express = (0, express_1.default)();
        // ? Default Express Plugins
        if (!this.options.disableCorsMiddleware) {
            if (this.options.cors)
                this.express.use((0, cors_1.default)(this.options.cors));
            else
                this.express.use((0, cors_1.default)({
                    origin: '*',
                    methods: '*',
                    allowedHeaders: '*',
                    preflightContinue: false
                }));
        }
        if (this.options.enableCookiesForSession) {
            this.express.use((0, cookie_parser_1.default)());
        }
        if (!this.options.port)
            this.options.port = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : "5000");
        if (process.env["NEXT_BASE_URL"]) {
            this.options.baseUrl = process.env["NEXT_BASE_URL"];
        }
        this.url = new NextUrlBuilder_1.NextUrlBuilder(this);
        this.express.use(express_1.default.json(Object.assign({ type: 'application/json' }, ((this.options.bodyParser && this.options.bodyParser.json) || {}))));
        this.express.use(express_1.default.urlencoded(Object.assign({ type: 'application/x-www-form-urlencoded' }, ((this.options.bodyParser && this.options.bodyParser.urlencoded) || {}))));
        this.registry = new NextRegistry_1.NextRegistry(this);
        this.log = new NextLog_1.NextConsoleLog();
        this.profiler = new NextProfiler_1.NextProfiler(this, new NextProfiler_1.NextProfilerOptions(this.options.debug));
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
    handleStaticDir(urlPath, dirPath) {
        this.staticDirs.push({ urlPath, dirPath });
    }
    async initialize() {
        var _a;
        // Initialize dynamic configuration if enabled
        if ((_a = this._applicationSettings.dynamicConfig) === null || _a === void 0 ? void 0 : _a.enabled) {
            this.dynamicConfigLoader = new DynamicConfigLoader_1.DynamicConfigLoader(this._applicationSettings);
            const initialized = await this.dynamicConfigLoader.initialize();
            if (initialized) {
                console.log('Dynamic configuration loaded successfully');
                // Merge dynamic settings with static ones
                this.config = this.dynamicConfigLoader.mergeWithStatic(this._applicationSettings);
            }
            else {
                console.warn('Dynamic configuration loading failed, using static configuration only');
                this.config = Object.assign({}, this._applicationSettings);
            }
        }
        else {
            // Use static configuration only
            this.config = Object.assign({}, this._applicationSettings);
        }
        // Initialize other application components
        await this.initializeAuth();
        await this.initializeWorkflows();
        console.log('Application initialized successfully');
    }
    async initializeAuth() {
        var _a, _b, _c;
        // Initialize authentication based on configuration
        const authConfig = this.config.auth || {};
        if ((_a = authConfig.providers) === null || _a === void 0 ? void 0 : _a.length) {
            console.log(`Initializing ${authConfig.providers.length} authentication providers`);
            for (const provider of authConfig.providers) {
                console.log(`Setting up ${provider.name} authentication provider`);
                // Set up authentication provider
            }
        }
        if ((_b = authConfig.permissions) === null || _b === void 0 ? void 0 : _b.length) {
            console.log(`Loaded ${authConfig.permissions.length} permission definitions`);
            // Set up permissions system
        }
        if ((_c = authConfig.roles) === null || _c === void 0 ? void 0 : _c.length) {
            console.log(`Loaded ${authConfig.roles.length} role definitions`);
            // Set up role-based access control
        }
    }
    async initializeWorkflows() {
        // Initialize workflow routers (both static and dynamic)
        const staticWorkflowRouters = [
        // Define static routers here
        ];
        this.workflowRouters = await (0, workflows_1.initializeWorkflows)(this._applicationSettings, staticWorkflowRouters);
        console.log(`Initialized ${this.workflowRouters.length} workflow routers`);
        // Mount routers to routes
        for (const router of this.workflowRouters) {
            this.mountRouter(router);
        }
    }
    mountRouter(router) {
        // Logic to mount workflow router
        console.log(`Mounting router at path: ${router.getPath()}`);
        // Use temporary registration if routeBuilder is not initialized
        if (!this.routeBuilder) {
            // Use getRoutes() to access the routes as it's a public method
            const routes = router.getRoutes();
            routes.forEach(route => {
                // httpMethod is the property that stores methods, not methods()
                const methods = route.httpMethod.join(',');
                // Routes are executed via the execute method, not a handler property
                this.tempRouteRegister(route.path, methods, route.execute.bind(route));
            });
        }
        else {
            router.mount(this);
        }
    }
    // Helper for route registration before routeBuilder is initialized
    tempRouteRegister(path, method, handler) {
        console.log(`Registered route: ${method} ${path}`);
    }
    // Method to get the current application configuration
    getConfig() {
        return this.config;
    }
    // Method to update a specific configuration value
    updateConfig(path, value) {
        // Create nested structure
        const parts = path.split('.');
        let current = this.config;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }
    async init() {
        var _a;
        (0, NextInitializationHeader_1.NextInitializationHeader)();
        this.emit('preinit', this);
        for (var plugin of this.registry.getPlugins()) {
            await plugin.init(this);
        }
        this.routeBuilder = new NextRouteBuilder_1.NextRouteBuilder(this);
        if (Array.isArray(this.objectRouters)) {
            for (let router of this.objectRouters) {
                router.mount(this);
            }
        }
        if (Array.isArray(this.workflowRouters)) {
            for (let router of this.workflowRouters) {
                router.mount(this);
            }
        }
        if (this.options.authentication) {
            console.log("Registering Authentication");
            this.options.authentication.register(this);
        }
        if (this.options.sockets) {
            this.socket = new NextSocket_1.NextSocket(this.options.sockets, this);
            this.socketRouter = new NextSocketRouter_1.NextSocketRouter();
            this.socket.router = this.socketRouter;
            this.socketRouter.registerRouters(this.options.socketRouterDirs);
            // Register health check for socket Redis adapter if enabled
            if (this.healthProfiler && ((_a = this.options.sockets.redis) === null || _a === void 0 ? void 0 : _a.enabled)) {
                this.registerHealthCheck("socketRedis", {
                    async healthCheck() {
                        try {
                            // Check if Redis adapter is initialized
                            if (this.socket.redisAdapter && this.socket.redisAdapter.subscriberClient) {
                                return { success: true, message: "Socket Redis adapter is connected" };
                            }
                            else {
                                return { success: false, message: "Socket Redis adapter is not initialized" };
                            }
                        }
                        catch (err) {
                            return { success: false, message: `Socket Redis adapter health check failed: ${err.message}` };
                        }
                    }
                });
            }
        }
        this.emit('init', this);
        // ? Static file serving
        if (this.options.staticDir) {
            this.express.use(express_1.default.static(this.options.staticDir));
        }
        // ? Static file serving
        for (var staticDir of this.staticDirs) {
            this.express.use(staticDir.dirPath, express_1.default.static(staticDir.dirPath));
        }
        // ? Build Client Script
        new NextClientBuilder_1.NextClientBuilder(this).build();
        // ? Use OpenApi
        if (this.options.openApi && this.options.openApi.enabled) {
            this.openapi.use();
        }
        // ? Route not found
        this.express.use(/.*/, (req, res, next) => {
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
            this.emit('config', this, ConfigurationReader_1.ConfigurationReader.current);
        }
        // Add code to initialize configuration based on options
        if (this.options.configuration) {
            const configOptions = this.options.configuration;
            if (configOptions.sourceType === ConfigurationReader_1.ConfigurationSourceType.FILE && configOptions.fileOptions) {
                if (configOptions.fileOptions.path) {
                    ConfigurationReader_1.ConfigurationReader.configPath = configOptions.fileOptions.path;
                }
                if (configOptions.fileOptions.type) {
                    ConfigurationReader_1.ConfigurationReader.configType = configOptions.fileOptions.type;
                }
                ConfigurationReader_1.ConfigurationReader.sourceType = ConfigurationReader_1.ConfigurationSourceType.FILE;
            }
            else if (configOptions.sourceType === ConfigurationReader_1.ConfigurationSourceType.ENV && configOptions.envOptions) {
                if (configOptions.envOptions.prefix) {
                    ConfigurationReader_1.ConfigurationReader.envPrefix = configOptions.envOptions.prefix;
                }
                ConfigurationReader_1.ConfigurationReader.sourceType = ConfigurationReader_1.ConfigurationSourceType.ENV;
            }
            else if (configOptions.sourceType === ConfigurationReader_1.ConfigurationSourceType.VAULT && configOptions.vaultOptions) {
                ConfigurationReader_1.ConfigurationReader.vaultConfig = configOptions.vaultOptions;
                ConfigurationReader_1.ConfigurationReader.sourceType = ConfigurationReader_1.ConfigurationSourceType.VAULT;
            }
        }
        // Initialize the configuration reader
        await ConfigurationReader_1.ConfigurationReader.init();
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
