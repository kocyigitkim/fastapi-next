import { NextApplication, NextContextBase } from '..';
import { NextRouteAction } from './NextRouteAction';
export declare class NextRouteBuilder {
    app: NextApplication;
    private paths;
    registeredRoutes: {
        path: string;
        method: string;
        action: NextRouteAction;
    }[];
    constructor(app: NextApplication);
    private handleHealthCheckEndpoints;
    private registerRoute;
    register(subPath: string, method: string, definition: (ctx: NextContextBase) => Promise<any>): any;
    private routeMiddleware;
    private scanDir;
}
//# sourceMappingURL=NextRouteBuilder.d.ts.map