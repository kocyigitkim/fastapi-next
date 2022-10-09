import EventEmitter from 'events';
import express from 'express';
import { NextHealthCheckOptions, NextOptions } from './config/NextOptions';
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

export type NextApplicationEventNames = 'preinit' | 'init' | 'start' | 'stop' | 'restart' | 'error' | 'destroy';
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
    public constructor(options: NextOptions) {
        super();
        this.realtime = new NextRealtimeFunctions(this);
        this.options = options;
        this.express = express();
        // ? Default Express Plugins
        if (options.cors) this.express.use(cors(options.cors));
        else this.express.use(cors({
            origin: '*',
            methods: '*',
            allowedHeaders: '*',
            preflightContinue: true
        }));
        this.express.use(express.json({ type: 'application/json', ...((options.bodyParser && options.bodyParser.json) || {}) }));
        this.express.use(express.urlencoded({ type: 'application/x-www-form-urlencoded', ...((options.bodyParser && options.bodyParser.urlencoded) || {}) }));
        this.registry = new NextRegistry(this);
        this.log = new NextConsoleLog();
        this.profiler = new NextProfiler(this, new NextProfilerOptions(options.debug));
        this.on('error', console.error);
    }
    public async registerFileSystemSession(rootPath: string, options?: NextSessionOptions) {
        this.express.use((this.sessionManager = new NextSessionManager(new FileSystemSessionStore(rootPath, options && options.ttl), options)).use);
    }
    public async registerInMemorySession(options?: NextSessionOptions) {
        this.express.use((this.sessionManager = new NextSessionManager(null, options)).use);
    }
    public async registerRedisSession(config: RedisClientOptions<any, any>, ttl: number = 30 * 60, options?: NextSessionOptions) {
        var session = new RedisSessionStore(config, ttl || options.ttl);
        await session.client.connect();
        this.express.use((this.sessionManager = new NextSessionManager(session, options)).use);
        if (this.options.healthCheck) this.registerHealthCheck("sessionManager", this.sessionManager);
    }
    public async init(): Promise<void> {
        NextInitializationHeader();
        this.emit('preinit', this);

        if (this.options.authentication) {
            this.options.authentication.register(this);
        }

        for (var plugin of this.registry.getPlugins()) {
            await plugin.init(this);
        }

        this.routeBuilder = new NextRouteBuilder(this);
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

        // ? Route not found
        this.express.use("*", (req, res, next) => {
            if (req.method?.toLowerCase() === "get") {
                if (req.headers["content-type"]?.toLowerCase() === "text/html") {
                    res.status(200);
                    res.header("Content-Type", "text/html");
                    res.send(this.options.routeNotFoundContent || "<h1>404 Not Found</h1>");
                }
            }
        });
    }
    public async start(): Promise<void> {
        NextRunning();
        this.server = this.express.listen(this.options.port, () => {
            this.log.info(`Server listening on port ${this.options.port}`);
        });
        this.emit('start', this);
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