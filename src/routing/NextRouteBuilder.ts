import { NextFunction, Request, Response } from 'express';
import fs, { appendFile } from 'fs';
import path from 'path';
import { Stream } from 'stream';
import { ApiResponse, NextApplication, NextContextBase } from '..';
import { NextFlag } from '../NextFlag';
import { ValidationResult } from '../validation/ValidationResult';
import { NextRouteAction } from './NextRouteAction';
import { NextRouteResponse, NextRouteResponseStatus } from './NextRouteResponse';
import { AnyObjectSchema, ValidationError } from 'yup'
export class NextRouteBuilder {
    private paths: string[] = [];
    public registeredRoutes: { path: string, method: string, action: NextRouteAction }[] = [];
    constructor(public app: NextApplication) {
        const isScanDirectoryDisabled = Boolean(process.env.DISABLE_SCAN_ROUTERS);
        this.handleHealthCheckEndpoints = this.handleHealthCheckEndpoints.bind(this);

        this.paths = app.options.routerDirs;
        if (!isScanDirectoryDisabled) {
            this.paths.forEach(p => {
                try {
                    var results = this.scanDir(p);
                    results.forEach(({ routePath, realpath }: any) => {
                        this.registerRoute(p, routePath, app, realpath);
                    });
                } catch (err) {
                    console.error(err);
                }
            });
        }

        const glob = (global as any);
        if (Array.isArray(glob.__fastapi_routes_rest)) {
            glob.__fastapi_routes_rest.forEach((route: any) => {
                this.register(route.details.routePath, route.details.detectedMethod, route.init());
            });
        }

        this.handleHealthCheckEndpoints();
    }
    private handleHealthCheckEndpoints() {
        if (this.app.options.healthCheck) {
            // Liveness check
            var isFirstInit = false;
            this.register(this.app.options.healthCheck.livenessPath, "get", async (ctx) => {
                try {
                    if (isFirstInit)
                        return new NextRouteResponse(200, "OK", true);

                    const plugins = this.app.registry.getPlugins();
                    const pluginHealths = await Promise.all(plugins.map(p => p.healthCheck(this.app)));
                    const objectHealths = await this.app.healthProfiler.healthCheck();
                    if (this.app.options.debug) {
                        console.log('Health Check', pluginHealths, objectHealths);
                    }
                    const hasError = pluginHealths.some(h => !h.success) || objectHealths.some(h => !h.status.success);
                    if (hasError) {
                        return new NextRouteResponse(503, JSON.stringify(pluginHealths, null, 2), true);
                    }
                    else {
                        isFirstInit = true;
                        return new NextRouteResponse(200, "OK", true);
                    }
                } catch (err) {
                    return new NextRouteResponse(503, err.message, true);
                }
            });
            // Readiness check
            this.register(this.app.options.healthCheck.readinessPath, "get", async (ctx) => {
                try {
                    const plugins = this.app.registry.getPlugins();
                    const pluginHealths = await Promise.all(plugins.map(p => p.healthCheck(this.app)));
                    const objectHealths = await this.app.healthProfiler.healthCheck();
                    const hasError = pluginHealths.some(h => !h.success) || objectHealths.some(h => !h.status.success);
                    if (this.app.options.debug) {
                        console.log('Health Check', pluginHealths, objectHealths);
                    }
                    if (hasError) {
                        return new NextRouteResponse(503, JSON.stringify(pluginHealths, null, 2), true);
                    }
                    else {
                        return new NextRouteResponse(200, "OK", true);
                    }
                } catch (err) {
                    return new NextRouteResponse(503, err.message, true);
                }
            });
        }
    }
    private registerRoute(p: string, routePath: any, app: NextApplication, realpath: any) {
        var parts = path.relative(p, routePath).split(path.sep);
        var expressRoutePath = "/" + parts.map(part => {
            return part.replace(/\[/g, ":").replace(/\]/g, "");
        }).join("/");
        var specificMethod = path.basename(expressRoutePath).split(".")[1];
        var httpMethod = expressRoutePath.indexOf(":") > -1 ? "get" : (specificMethod || "get");
        if (specificMethod == httpMethod && specificMethod) {
            expressRoutePath = expressRoutePath.replace("." + specificMethod, "");
        }
        if (app.options.debug) {
            app.log.info(`Registering route ${httpMethod} ${expressRoutePath}`);
        }
        var route: NextRouteAction = typeof (realpath) === 'string' ? require(realpath) : realpath;
        app.express[httpMethod](expressRoutePath, (this.routeMiddleware(app)).bind(null, route));
        this.registeredRoutes.push({ path: expressRoutePath, action: route, method: httpMethod });
        if (parts.length > 1 && parts[parts.length - 1] === "index" || parts[0] === "index") {
            const modifiedPath = expressRoutePath.substring(0, expressRoutePath.length - "index".length);
            app.express[httpMethod](modifiedPath, (this.routeMiddleware(app)).bind(null, route));
            this.registeredRoutes.push({ path: modifiedPath, action: route, method: httpMethod });
        }
    }

    public register(subPath: string, method: string, definition: (ctx: NextContextBase) => Promise<any>) {
        var res = this.app.express[method](subPath, (this.routeMiddleware(this.app)).bind(null, { default: definition }));
        this.registeredRoutes.push({ path: subPath, action: { default: definition } as any, method: method });
        return res;
    }

    private routeMiddleware(app: NextApplication) {
        return async (route: NextRouteAction, req: Request, res: Response, next: NextFunction) => {
            var ctx: NextContextBase = new NextContextBase(req, res, next);
            ctx.app = app;
            for (var plugin of app.registry.getPlugins()) {
                var mwResult = await plugin.middleware.call(plugin, ctx).catch(app.log.error);
                if (typeof mwResult === 'boolean' && !mwResult) {
                    break;
                }
                else if (typeof mwResult === 'number') {
                    if (mwResult === NextFlag.Exit) {
                        return;
                    }
                }

                if (plugin.showInContext) {
                    var retrieveResult = plugin.retrieve.call(plugin, ctx);
                    if (retrieveResult instanceof Promise) {
                        retrieveResult = await retrieveResult.catch(app.log.error);
                    }
                    (ctx as any)[plugin.name] = retrieveResult;
                }
            }

            // ? Validation
            if (route.validate) {
                if (typeof route.validate === 'function') {
                    try {
                        var validationResult = route.validate(ctx);
                        if (validationResult instanceof Promise) {
                            validationResult = await validationResult.catch(app.log.error);
                        }
                        if (!validationResult || !validationResult.success) {
                            res.status(500).json(new ApiResponse<ValidationResult>(false, "validation error!", validationResult));
                            return;
                        }
                    } catch (err) {
                        app.log.error(err);
                        var errorResult = new ValidationResult();
                        errorResult.error("err", (err || new Error()).toString());
                        res.status(500).json(new ApiResponse<ValidationResult>(false, "validation error!", errorResult));
                        return;
                    }
                }
                else if (typeof route.validate === 'object') {
                    var validateSchema = route.validate as AnyObjectSchema;
                    var isError = false;
                    var result = await validateSchema.validate(ctx.all).catch((err) => {
                        isError = true;
                        return err;
                    });
                    if (isError) {
                        var yupResult = new ValidationResult();
                        var yupError: ValidationError = result as ValidationError;
                        yupResult.error(yupError.path, yupError.message);
                        res.status(400).json(new ApiResponse<ValidationResult>(false, "validation error!", yupResult));
                        return;
                    }
                    else {
                        ctx.body = result;
                    }
                }
            }

            // ? Permission
            if (app.options.authorization) {
                if (!await app.options.authorization.check(ctx, route.permission)) {
                    res.status(403).json(new ApiResponse().setError("Forbidden"))
                    return;
                }
            }

            // ? Execution
            var result: any = route.default(ctx);
            var isError = false;
            if (result instanceof Promise) {
                result = await result.catch((err) => {
                    isError = true;
                    app.log.error(err);
                });
            }
            if (result instanceof NextRouteResponse) {
                if (result.statusCode == NextRouteResponseStatus.REDIRECT) {
                    res.redirect(result.statusCode, result.body);
                    return;
                }
                if (result.hasBody) {
                    res.status(result.statusCode);
                    for (var header in result.headers) {
                        res.setHeader(header, result.headers[header]);
                    }
                    if (result.body instanceof Stream) {
                        result.body.pipe(res);
                        return;
                    }
                    else {
                        res.send(result.body);
                        return;
                    }
                } else {
                    res.status(result.statusCode).end();
                    return;
                }
            }
            else {
                res.set("Content-Type", "application/json");
                if (isError) {
                    res.status(500).json(result);
                }
                else {
                    res.status(200).json(result);
                }
                return;
            }
            next();
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