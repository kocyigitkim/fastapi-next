"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextProfiler = exports.NextDebug = exports.NextProfilerOptions = void 0;
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
        try {
            next();
        }
        catch (err) {
            debug.error(err);
            res.sendStatus(500);
        }
    }
}
exports.NextProfiler = NextProfiler;
