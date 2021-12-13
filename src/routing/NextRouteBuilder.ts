import fs from 'fs';
import path from 'path';
import { NextApplication, NextContext } from '..';
import { NextRouteResponse } from './NextRouteResponse';

export class NextRouteBuilder {
    private paths: string[] = [];
    constructor(app: NextApplication) {
        this.paths = app.options.routerDirs;
        this.paths.forEach(p => {
            var results = this.scanDir(p);
            results.forEach(({ routePath, realpath }: any) => {
                this.registerRoute(p, routePath, app, realpath);
            });
        });
    }
    private registerRoute(p: string, routePath: any, app: NextApplication, realpath: any) {
        var parts = path.relative(p, routePath).split(path.sep);
        var expressRoutePath = "/" + parts.map(part => {
            return part.replace(/\[/g, ":").replace(/\]/g, "");
        }).join("/");
        var specificMethod = path.basename(expressRoutePath).split(".")[1];
        var httpMethod = expressRoutePath.indexOf(":") > -1 ? "get" : (specificMethod || "all");
        if (specificMethod == httpMethod && specificMethod) {
            expressRoutePath = expressRoutePath.replace("." + specificMethod, "");
        }
        if (app.options.debug) {
            app.log.info(`Registering route ${httpMethod} ${expressRoutePath}`);
        }
        var route = require(realpath);
        app.express[httpMethod](expressRoutePath, (this.routeMiddleware(app)).bind(null, route));
        if (parts.length > 1 && parts[parts.length - 1] === "index") {
            app.express[httpMethod](expressRoutePath.substring(0, expressRoutePath.length - "index".length), (this.routeMiddleware(app)).bind(null, route));
        }
    }

    private routeMiddleware(app: NextApplication) {
        return async (route: any, req, res, next) => {
            var ctx = new NextContext(req, res, next);
            for (var plugin of app.registry.getPlugins()) {
                if (!plugin.middleware(ctx)) {
                    break;
                }

                if (plugin.showInContext) {
                    (ctx as any)[plugin.name] = plugin;
                }
            }

            var result = route.default(ctx);
            var isError = false;
            if (result instanceof Promise) {
                result = await result.catch((err) => {
                    isError = true;
                    app.log.error(err);
                });
            }
            if (result instanceof NextRouteResponse) {
                if (result.hasBody) {
                    res.status(result.statusCode).send(result.body);
                } else {
                    res.status(result.statusCode).end();
                }
            }
            else {
                if (isError) {
                    res.status(500).send(result);
                }
                else {
                    res.status(200).send(result);
                }
            }
        };
    }

    private scanDir(scanPath?: string) {
        if (!scanPath) return null;
        var files = [];
        fs.readdirSync(scanPath, {
            withFileTypes: true
        }).forEach(dir => {
            if (dir.isDirectory()) {
                this.scanDir(path.join(scanPath, dir.name)).forEach(f => {
                    files.push(f);
                });
            }
            else {
                if (dir.name.endsWith('.ts') || dir.name.endsWith('.js')) {
                    files.push({
                        routePath: path.join(scanPath, path.basename(dir.name, path.extname(dir.name))),
                        realpath: path.join(scanPath, dir.name)
                    });
                }
            }
        });
        return files;
    }
}