import { NextContextBase, NextRouteResponse } from "..";
import { NextApplication } from "../NextApplication";
import { WorkflowRoute } from "./WorkflowRoute";

export class WorkflowRouter {
    public name: string;
    public description: string;
    
    private routes: WorkflowRoute[] = [];
    private subRouters: WorkflowRouter[] = [];
    constructor(private path: string) {
    }

    public getPath(): string {
        return this.path;
    }

    public getRoutes(): WorkflowRoute[] {
        return this.routes;
    }

    public add(route: WorkflowRoute) {
        this.routes.push(route);
        return this;
    }

    public route(path: string) {
        let rt = new WorkflowRoute(this, path);
        this.routes.push(rt);
        return rt;
    }

    public subRouter(path: string) {
        let router = new WorkflowRouter([this.path, path].join("/"));
        this.subRouters.push(router);
        return router;
    }

    public mount(app: NextApplication) {
        for (let router of this.subRouters) {
            router.mount(app);
        }

        for (let route of this.routes) {
            if (route.httpMethod.length > 0) {
                for (let method of route.httpMethod) {
                    app.routeBuilder.register(route.getPath(), method, this.buildRouteExecutor(method, route));
                }
            }
            else {
                app.routeBuilder.register(route.getPath(), 'POST', this.buildRouteExecutor('POST', route));
            }
        }
    }
    private buildRouteExecutor(method: string, route: WorkflowRoute) {
        var result: any = async (ctx: NextContextBase) => {
            const result = await route.execute(ctx);
            if (result.context) delete result.context;
            let response: NextRouteResponse =
                NextRouteResponse.Json(result, result.status || 200);
            return response;
        };
        result.validate = (route.actions.find(a => a.command === 'validate') as any)?.schema;
        let authorizationDefinition: any = route.actions.find(a => a.command === 'authorize');
        result.permission = {
            anonymous: authorizationDefinition?.anonymous,
            path: authorizationDefinition?.anonymous === true ? undefined : (
                route.getPath()
            ),
            custom: authorizationDefinition?.custom
        };
        result.description = route.description;
        result.summary = route.summary;
        result.tags = route.tags;
        result.deprecated = route.isDeprecated;
        return result;
    }
}