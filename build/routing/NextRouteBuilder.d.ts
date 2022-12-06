import { NextApplication, NextContextBase } from '..';
import { NextRouteAction } from './NextRouteAction';
import { YupSchemaParsed } from '../reflection/YupVisitor';
export declare class NextRouteBuilder {
    app: NextApplication;
    private paths;
    registeredRoutes: {
        path: string;
        method: string;
        action: NextRouteAction;
        requestSchema?: YupSchemaParsed;
    }[];
    constructor(app: NextApplication);
    private handleHealthCheckEndpoints;
    private registerRoute;
    register(subPath: string, method: string, definition: (ctx: NextContextBase) => Promise<any>): any;
    private routeMiddleware;
    private scanDir;
}
//# sourceMappingURL=NextRouteBuilder.d.ts.map