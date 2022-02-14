import EventEmitter from 'events';
import express from 'express';
import { NextOptions } from './config/NextOptions';
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
export class NextApplication extends EventEmitter {
    public express: express.Application;
    public registry: NextRegistry;
    public options: NextOptions;
    public log: NextLog;
    public profiler: NextProfiler;
    public routeBuilder: NextRouteBuilder;
    public server: http.Server;
    public constructor(options: NextOptions) {
        super();
        this.options = options;
        this.express = express();
        // ? Default Express Plugins
        this.express.use(cors(options.cors));
        this.express.use(express.json({ type: 'application/json' }));
        this.express.use(express.urlencoded({ type: 'application/x-www-form-urlencoded' }));
        this.registry = new NextRegistry(this);
        this.log = new NextConsoleLog();
        this.profiler = new NextProfiler(this, new NextProfilerOptions(options.debug));
    }
    public async registerInMemorySession(options?: NextSessionOptions) {
        this.express.use(new NextSessionManager(null, options).use);
    }
    public async registerRedisSession(config: RedisClientOptions<any, any>, ttl: number = 30 * 60, options?: NextSessionOptions) {
        var session = new RedisSessionStore(config, ttl);
        await session.client.connect();
        this.express.use(new NextSessionManager(session, options).use);
    }
    public async init(): Promise<void> {
        NextInitializationHeader();
        this.emit('preinit', this);

        for (var plugin of this.registry.getPlugins()) {
            await plugin.init(this);
        }

        this.routeBuilder = new NextRouteBuilder(this);
        this.emit('init', this);
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