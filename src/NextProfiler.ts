import { Application, NextFunction, Request, Response } from "express";
import { NextApplication } from ".";
import { NextContext } from "./NextContext";
import { precisionRound } from "./utils";

export class NextProfilerOptions {
    constructor(public debug: boolean = true) { }
}
export class NextDebug {
    public requestDate: Date;
    constructor(public profiler: NextProfiler, public context: Request) {
        this.requestDate = new Date();
        this.complete = this.complete.bind(this);
        this.error = this.error.bind(this);
    }
    complete() {
        var elapsed = (new Date().valueOf() - this.requestDate.valueOf());
        var log = this.profiler.app.log;
        log.log(`${this.context.method} ${this.context.path} completed in ${elapsed} ms`);
    }
    error(err: Error) {
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
export class NextProfiler {
    constructor(public app: NextApplication, public options: NextProfilerOptions = new NextProfilerOptions()) {
        app.express.use(this.worker.bind(this));
    }
    private async worker(req: Request, res: Response, next: NextFunction): Promise<void> {
        var debug = new NextDebug(this, req);
        res.on('close', debug.complete);
        res.on('error', debug.error);
        try {
            next();
        } catch (err) {
            debug.error(err);
            res.sendStatus(500);
        }
    }
}