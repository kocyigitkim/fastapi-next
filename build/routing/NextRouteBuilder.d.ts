import { NextApplication, NextContextBase } from '..';
export declare class NextRouteBuilder {
    app: NextApplication;
    private paths;
    constructor(app: NextApplication);
    private registerRoute;
    register(subPath: string, method: string, definition: (ctx: NextContextBase) => Promise<any>): any;
    private routeMiddleware;
    private scanDir;
}
//# sourceMappingURL=NextRouteBuilder.d.ts.map