"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextApplication = void 0;
const events_1 = __importDefault(require("events"));
const express_1 = __importDefault(require("express"));
const NextInitializationHeader_1 = require("./NextInitializationHeader");
const NextLog_1 = require("./NextLog");
const NextProfiler_1 = require("./NextProfiler");
const NextRegistry_1 = require("./NextRegistry");
const NextRouteBuilder_1 = require("./routing/NextRouteBuilder");
const cors_1 = __importDefault(require("cors"));
class NextApplication extends events_1.default {
    constructor(options) {
        super();
        this.options = options;
        this.express = (0, express_1.default)();
        // ? Default Express Plugins
        this.express.use((0, cors_1.default)(options.cors));
        this.express.use(express_1.default.json({ type: 'application/json' }));
        this.express.use(express_1.default.urlencoded({ type: 'application/x-www-form-urlencoded' }));
        this.registry = new NextRegistry_1.NextRegistry(this);
        this.log = new NextLog_1.NextConsoleLog();
        this.profiler = new NextProfiler_1.NextProfiler(this, new NextProfiler_1.NextProfilerOptions(options.debug));
    }
    async init() {
        (0, NextInitializationHeader_1.NextInitializationHeader)();
        this.emit('preinit', this);
        for (var plugin of this.registry.getPlugins()) {
            await plugin.init(this);
        }
        this.routeBuilder = new NextRouteBuilder_1.NextRouteBuilder(this);
        this.emit('init', this);
    }
    async start() {
        (0, NextInitializationHeader_1.NextRunning)();
        this.emit('start', this);
        this.express.listen(this.options.port, () => {
            this.log.info(`Server listening on port ${this.options.port}`);
        });
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
