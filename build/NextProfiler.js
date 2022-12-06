"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextProfiler = exports.NextDebug = exports.NextProfilerOptions = void 0;
const crypto_1 = require("crypto");
class NextProfilerOptions {
    constructor(debug = true) {
        this.debug = debug;
    }
}
exports.NextProfilerOptions = NextProfilerOptions;
class NextDebug {
    constructor(profiler, context) {
        this.profiler = profiler;
        this.context = context;
        this.requestDate = new Date();
        this.complete = this.complete.bind(this);
        this.error = this.error.bind(this);
    }
    complete() {
        if (!this.profiler.app.options.debug)
            return;
        var elapsed = (new Date().valueOf() - this.requestDate.valueOf());
        var log = this.profiler.app.log;
        log.log(`${this.context.method} ${this.context.path} completed in ${elapsed} ms`);
    }
    error(err) {
        if (!(err instanceof Error)) {
            err = new Error(err);
        }
        var log = this.profiler.app.log;
        var elapsed = (new Date().valueOf() - this.requestDate.valueOf());
        log.error(`${this.context.method} ${this.context.path} failed in ${elapsed} ms`);
        log.error(err.message);
        log.error("Stack trace:");
        log.error(err.stack);
    }
    new() {
        if (!this.profiler.app.options.debug)
            return;
        var log = this.profiler.app.log;
        log.log(`${this.context.method} ${this.context.path} requested`);
    }
}
exports.NextDebug = NextDebug;
class NextProfiler {
    constructor(app, options = new NextProfilerOptions()) {
        this.app = app;
        this.options = options;
        app.express.use(this.worker.bind(this));
    }
    async worker(req, res, next) {
        var debug = new NextDebug(this, req);
        res.on('close', debug.complete);
        res.on('error', debug.error);
        debug.new();
        try {
            next();
        }
        catch (err) {
            var errorId = (0, crypto_1.randomUUID)();
            debug.error(`${errorId} - ${err}`);
            res.status(500);
            res.send("Internal Server Error - Error ID: " + errorId);
        }
    }
}
exports.NextProfiler = NextProfiler;
