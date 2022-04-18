import { Request } from "express";
import { NextApplication } from ".";
export declare class NextProfilerOptions {
    debug: boolean;
    constructor(debug?: boolean);
}
export declare class NextDebug {
    profiler: NextProfiler;
    context: Request;
    requestDate: Date;
    constructor(profiler: NextProfiler, context: Request);
    complete(): void;
    error(err: Error): void;
    new(): void;
}
export declare class NextProfiler {
    app: NextApplication;
    options: NextProfilerOptions;
    constructor(app: NextApplication, options?: NextProfilerOptions);
    private worker;
}
//# sourceMappingURL=NextProfiler.d.ts.map