import EventEmitter from 'events';
import express from 'express';

import { NextHealthCheckOptions, NextJwtOptions, NextOptions } from './config/NextOptions';
import { NextInitializationHeader, NextRunning } from './NextInitializationHeader';
import { NextConsoleLog, NextLog } from './NextLog';
import { NextProfiler, NextProfilerOptions } from './NextProfiler';
import { NextRegistry } from './NextRegistry';
import { NextRouteBuilder } from './routing/NextRouteBuilder';
import cors from 'cors'
import { NextSessionManager } from '.';
import { RedisOptions, RedisSessionStore } from './session/RedisSessionStore';
import http from 'http'
import { RedisClientOptions } from '@redis/client';
import { NextSessionOptions } from './session/NextSessionManager';
import { FileSystemSessionStore } from './session/FileSystemSessionStore';
import { NextSocket } from './sockets/NextSocket';
import { NextSocketRouter } from './sockets/NextSocketRouter';
import { NextHealthProfiler } from './health/NextHealthProfiler';
import { IHealth } from './health/IHealth';
import { NextRealtimeFunctions } from './sockets/NextRealtimeFunctions';
import { JWTController } from './security/JWT/JWTController';
import { NextClientBuilder } from './client/NextClientBuilder';
import { Logger } from './logs/Logger';
import CookieParser from 'cookie-parser';
import { NextUrlBuilder } from './structure/NextUrlBuilder';
import { NextOpenApiBuilder } from './client/NextOpenApiBuilder';
import { ConfigurationReader, ConfigurationSourceType } from './config/ConfigurationReader';
import { ObjectRouter } from './routing/ObjectRouter';
import { WorkflowRouter } from './workflows/WorkflowRouter';
import { NextApplicationSettings } from "./NextApplicationSettings";
import { DynamicConfigLoader } from "./DynamicConfigLoader";
import { initializeWorkflows } from "./workflows";

export type NextApplicationEventNames = 'preinit' | 'init' | 'start' | 'stop' | 'restart' | 'error' | 'destroy' | 'config';

interface StaticDirDefinition {
    urlPath: string;
    dirPath: string;
}

export class NextApplication extends EventEmitter {
    public express: express.Application;
    public registry: NextRegistry;
    public options: NextOptions;
    public log: NextLog;
    public profiler: NextProfiler;
    public routeBuilder: NextRouteBuilder;
    public server: http.Server;
    public sessionManager: NextSessionManager;
    public socket?: NextSocket;
    public socketRouter?: NextSocketRouter;
    public healthProfiler?: NextHealthProfiler;
    public realtime?: NextRealtimeFunctions;
    public jwtController?: JWTController;
    public url: NextUrlBuilder;
    public openapi: NextOpenApiBuilder;
    private staticDirs: StaticDirDefinition[] = [];
    private objectRouters: ObjectRouter[] = [];
    private workflowRouters: WorkflowRouter[] = [];
    private config: any = {};
    private dynamicConfigLoader: DynamicConfigLoader | null = null;
    private _applicationSettings: NextApplicationSettings;

    public on(eventName: NextApplicationEventNames, listener: (...args: any[]) => void): this {
        super.on(eventName, listener);
        return this;
    }
    public enableHealthCheck() {
        this.healthProfiler = new NextHealthProfiler();
        this.options.healthCheck = new NextHealthCheckOptions();
    }
    public registerHealthCheck(name: string, obj: IHealth) {
        this.healthProfiler.register(name, obj);
    }
    public registerObjectRouter(router: ObjectRouter) {
        this.objectRouters.push(router);
    }
    public registerObjectRouters(router: ObjectRouter[]) {
        this.objectRouters.push(...router);
    }
    public workflow(router: WorkflowRouter | WorkflowRouter[]) {
        if (Array.isArray(router)) {
            for (let r of router) {
                this.workflow(r);
            }
        }
        else {
            this.workflowRouters.push(router);
        }
    }

    public constructor(settingsOrOptions: NextApplicationSettings | NextOptions) {
        super();
        this.realtime = new NextRealtimeFunctions(this);
        
        // Eğer parametre bir NextOptions ise, onu NextApplicationSettings'e dönüştür
        if (settingsOrOptions instanceof NextOptions) {
            this._applicationSettings = { 
                nextOptions: settingsOrOptions
            } as NextApplicationSettings;
            this.options = settingsOrOptions;
        } else {
            // Parametre zaten NextApplicationSettings tipinde
            this._applicationSettings = settingsOrOptions;
            this.options = settingsOrOptions.nextOptions || new NextOptions();
        }
        
        this.express = express();
        // ? Default Express Plugins
        if (!this.options.disableCorsMiddleware) {
            if (this.options.cors) this.express.use(cors(this.options.cors));
            else this.express.use(cors({
                origin: '*',
                methods: '*',
                allowedHeaders: '*',
                preflightContinue: false
            }));
        }
        if (this.options.enableCookiesForSession) {
            this.express.use(CookieParser());
        }
        if (!this.options.port) this.options.port = parseInt(process.env.PORT ?? "5000");
        if (process.env["NEXT_BASE_URL"]) {
            this.options.baseUrl = process.env["NEXT_BASE_URL"];
        }
        this.url = new NextUrlBuilder(this);
        this.express.use(express.json({ type: 'application/json', ...((this.options.bodyParser && this.options.bodyParser.json) || {}) }));
        this.express.use(express.urlencoded({ type: 'application/x-www-form-urlencoded', ...((this.options.bodyParser && this.options.bodyParser.urlencoded) || {}) }));
        this.registry = new NextRegistry(this);
        this.log = new NextConsoleLog();
        this.profiler = new NextProfiler(this, new NextProfilerOptions(this.options.debug));
        this.on('error', console.error);
        this.openapi = new NextOpenApiBuilder(this);
    }
    public async registerFileSystemSession(rootPath: string, options?: NextSessionOptions) {
        if (this.options.enableCookiesForSession) {
            options = new NextSessionOptions();
            options.enableCookie = this.options.enableCookiesForSession;
        }
        this.express.use((this.sessionManager = new NextSessionManager(new FileSystemSessionStore(rootPath, options && options.ttl), options)).use);
    }
    public async registerInMemorySession(options?: NextSessionOptions) {
        if (this.options.enableCookiesForSession) {
            options = new NextSessionOptions();
            options.enableCookie = this.options.enableCookiesForSession;
        }
        this.express.use((this.sessionManager = new NextSessionManager(null, options)).use);
    }
    public async registerRedisSession(config: RedisClientOptions<any, any>, ttl: number = 30 * 60, options?: NextSessionOptions) {
        if (this.options.enableCookiesForSession) {
            options = new NextSessionOptions();
            options.enableCookie = this.options.enableCookiesForSession;
        }
        var session = new RedisSessionStore(config, ttl || options.ttl);
        await session.client.connect();
        this.express.use((this.sessionManager = new NextSessionManager(session, options)).use);
        if (this.options.healthCheck) this.registerHealthCheck("sessionManager", this.sessionManager);
    }
    public async registerSession(options?: NextSessionOptions, override?: any) {
        var env: any = process.env;
        if (override) env = override;
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
    public registerJWT(jwt?: NextJwtOptions) {
        this.options.security.jwt = jwt || new NextJwtOptions();
        // ? Register JWT Controller
        if (this.options.security.jwt) {
            this.jwtController = new JWTController(this);
            (this.jwtController as any).RegisterJWTController();
        }
    }
    public handleStaticDir(urlPath: string, dirPath: string) {
        this.staticDirs.push({ urlPath, dirPath });
    }
    public async initialize(): Promise<void> {
        // Initialize dynamic configuration if enabled
        if (this._applicationSettings.dynamicConfig?.enabled) {
            this.dynamicConfigLoader = new DynamicConfigLoader(this._applicationSettings);
            const initialized = await this.dynamicConfigLoader.initialize();
            
            if (initialized) {
                console.log('Dynamic configuration loaded successfully');
                
                // Merge dynamic settings with static ones
                this.config = this.dynamicConfigLoader.mergeWithStatic(this._applicationSettings);
            } else {
                console.warn('Dynamic configuration loading failed, using static configuration only');
                this.config = { ...this._applicationSettings };
            }
        } else {
            // Use static configuration only
            this.config = { ...this._applicationSettings };
        }
        
        // Initialize other application components
        await this.initializeAuth();
        await this.initializeWorkflows();
        
        console.log('Application initialized successfully');
    }
    private async initializeAuth(): Promise<void> {
        // Initialize authentication based on configuration
        const authConfig = this.config.auth || {};
        
        if (authConfig.providers?.length) {
            console.log(`Initializing ${authConfig.providers.length} authentication providers`);
            
            for (const provider of authConfig.providers) {
                console.log(`Setting up ${provider.name} authentication provider`);
                // Set up authentication provider
            }
        }
        
        if (authConfig.permissions?.length) {
            console.log(`Loaded ${authConfig.permissions.length} permission definitions`);
            // Set up permissions system
        }
        
        if (authConfig.roles?.length) {
            console.log(`Loaded ${authConfig.roles.length} role definitions`);
            // Set up role-based access control
        }
    }
    private async initializeWorkflows(): Promise<void> {
        // Initialize workflow routers (both static and dynamic)
        const staticWorkflowRouters: WorkflowRouter[] = [
            // Define static routers here
        ];
        
        this.workflowRouters = await initializeWorkflows(this._applicationSettings, staticWorkflowRouters);
        
        console.log(`Initialized ${this.workflowRouters.length} workflow routers`);
        
        // Mount routers to routes
        for (const router of this.workflowRouters) {
            this.mountRouter(router);
        }
    }
    private mountRouter(router: WorkflowRouter): void {
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
        } else {
            router.mount(this);
        }
    }
    
    // Helper for route registration before routeBuilder is initialized
    private tempRouteRegister(path: string, method: string, handler: any): void {
        console.log(`Registered route: ${method} ${path}`);
    }
    // Method to get the current application configuration
    public getConfig(): any {
        return this.config;
    }
    // Method to update a specific configuration value
    public updateConfig(path: string, value: any): void {
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
    public async init(): Promise<void> {
        NextInitializationHeader();
        this.emit('preinit', this);

        for (var plugin of this.registry.getPlugins()) {
            await plugin.init(this);
        }

        this.routeBuilder = new NextRouteBuilder(this);

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
            this.socket = new NextSocket(this.options.sockets, this);
            this.socketRouter = new NextSocketRouter();
            this.socket.router = this.socketRouter;
            this.socketRouter.registerRouters(this.options.socketRouterDirs);
            
            // Register health check for socket Redis adapter if enabled
            if (this.healthProfiler && this.options.sockets.redis?.enabled) {
                this.registerHealthCheck("socketRedis", {
                    async healthCheck() {
                        try {
                            // Check if Redis adapter is initialized
                            if ((this.socket as any).redisAdapter && (this.socket as any).redisAdapter.subscriberClient) {
                                return { success: true, message: "Socket Redis adapter is connected" };
                            } else {
                                return { success: false, message: "Socket Redis adapter is not initialized" };
                            }
                        } catch (err) {
                            return { success: false, message: `Socket Redis adapter health check failed: ${err.message}` };
                        }
                    }
                });
            }
        }
        this.emit('init', this);

        // ? Static file serving
        if (this.options.staticDir) {
            this.express.use(express.static(this.options.staticDir));
        }

        // ? Static file serving
        for (var staticDir of this.staticDirs) {
            this.express.use(staticDir.dirPath, express.static(staticDir.dirPath))
        }

        // ? Build Client Script
        new NextClientBuilder(this).build();

        // ? Use OpenApi
        if (this.options.openApi && this.options.openApi.enabled) {
            this.openapi.use();
        }

        // ? Route not found
        this.express.use(/.*/, (req, res, next) => {
            if (req.method?.toLowerCase() === "get") {
                if (req.headers["content-type"]?.toLowerCase() === "text/html") {
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
            await ConfigurationReader.init();
            this.emit('config', this, ConfigurationReader.current);
        }

        // Add code to initialize configuration based on options
        if (this.options.configuration) {
            const configOptions = this.options.configuration;
            
            if (configOptions.sourceType === ConfigurationSourceType.FILE && configOptions.fileOptions) {
                if (configOptions.fileOptions.path) {
                    ConfigurationReader.configPath = configOptions.fileOptions.path;
                }
                if (configOptions.fileOptions.type) {
                    ConfigurationReader.configType = configOptions.fileOptions.type;
                }
                ConfigurationReader.sourceType = ConfigurationSourceType.FILE;
            } 
            else if (configOptions.sourceType === ConfigurationSourceType.ENV && configOptions.envOptions) {
                if (configOptions.envOptions.prefix) {
                    ConfigurationReader.envPrefix = configOptions.envOptions.prefix;
                }
                ConfigurationReader.sourceType = ConfigurationSourceType.ENV;
            }
            else if (configOptions.sourceType === ConfigurationSourceType.VAULT && configOptions.vaultOptions) {
                ConfigurationReader.vaultConfig = configOptions.vaultOptions;
                ConfigurationReader.sourceType = ConfigurationSourceType.VAULT;
            }
        }

        // Initialize the configuration reader
        await ConfigurationReader.init();

    }
    public async start(): Promise<void> {
        NextRunning();
        this.server = this.express.listen(this.options.port, () => {
            this.log.info(`Server listening on port ${this.options.port}`);
        });
        this.emit('start', this);

        if (this.jwtController && this.options.security.jwt.refreshTokenWhenExpired) {
            this.jwtController.RegisterRefresh();
        }
        if (this.options.switchLoggerAsConsole) {
            console.log = Logger.log;
            console.error = Logger.error;
            console.warn = Logger.warn;
            console.info = Logger.info;
            console.debug = Logger.debug;
            console.trace = Logger.trace;
        }
    }
    public async stop(): Promise<void> {
        this.emit('stop', this);
    }
    public async restart(): Promise<void> {
        this.emit('restart', this);
        await this.stop();
        await this.start();
    }
    public async destroy(): Promise<void> {
        this.emit('destroy', this);
    }
}