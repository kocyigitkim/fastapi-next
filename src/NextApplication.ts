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
import { RedisClientOptions } from 'redis';
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
import { ConfigurationReader } from './config/ConfigurationReader';
import { ObjectRouter } from './routing/ObjectRouter';
export type NextApplicationEventNames = 'preinit' | 'init' | 'start' | 'stop' | 'restart' | 'error' | 'destroy';

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
    public constructor(options?: NextOptions) {
        super();
        this.realtime = new NextRealtimeFunctions(this);
        this.options = options || new NextOptions();
        this.express = express();
        // ? Default Express Plugins
        if (!options.disableCorsMiddleware) {
            if (options.cors) this.express.use(cors(options.cors));
            else this.express.use(cors({
                origin: '*',
                methods: '*',
                allowedHeaders: '*',
                preflightContinue: false
            }));
        }
        if (options.enableCookiesForSession) {
            this.express.use(CookieParser());
        }
        if (!this.options.port) this.options.port = parseInt(process.env.PORT ?? "5000");
        if (process.env["NEXT_BASE_URL"]) {
            this.options.baseUrl = process.env["NEXT_BASE_URL"];
        }
        this.url = new NextUrlBuilder(this);
        this.express.use(express.json({ type: 'application/json', ...((options.bodyParser && options.bodyParser.json) || {}) }));
        this.express.use(express.urlencoded({ type: 'application/x-www-form-urlencoded', ...((options.bodyParser && options.bodyParser.urlencoded) || {}) }));
        this.registry = new NextRegistry(this);
        this.log = new NextConsoleLog();
        this.profiler = new NextProfiler(this, new NextProfilerOptions(options.debug));
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

        if (this.options.authentication) {
            console.log("Registering Authentication");
            this.options.authentication.register(this);
        }

        if (this.options.sockets) {
            this.socket = new NextSocket(this.options.sockets, this);
            this.socketRouter = new NextSocketRouter();
            this.socket.router = this.socketRouter;
            this.socketRouter.registerRouters(this.options.socketRouterDirs);
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
        this.express.use("*", (req, res, next) => {
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
        }

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