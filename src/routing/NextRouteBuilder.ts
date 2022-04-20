import { NextFunction, Request, Response } from 'express';
import fs, { appendFile } from 'fs';
import path from 'path';
import { Stream } from 'stream';
import { ApiResponse, NextApplication, NextContextBase } from '..';
import { NextFlag } from '../NextFlag';
import { ValidationResult } from '../validation/ValidationResult';
import { NextRouteAction } from './NextRouteAction';
import { NextRouteResponse } from './NextRouteResponse';
import { AnyObjectSchema, ValidationError } from 'yup'
export class NextRouteBuilder {
    private paths: string[] = [];
    constructor(public app: NextApplication) {
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
        var httpMethod = expressRoutePath.indexOf(":") > -1 ? "get" : (specificMethod || "get");
        if (specificMethod == httpMethod && specificMethod) {
            expressRoutePath = expressRoutePath.replace("." + specificMethod, "");
        }
        if (app.options.debug) {
            app.log.info(`Registering route ${httpMethod} ${expressRoutePath}`);
        }
        var route: NextRouteAction = typeof (realpath) === 'string' ? require(realpath) : realpath;
        app.express[httpMethod](expressRoutePath, (this.routeMiddleware(app)).bind(null, route));
        if (parts.length > 1 && parts[parts.length - 1] === "index") {
            app.express[httpMethod](expressRoutePath.substring(0, expressRoutePath.length - "index".length), (this.routeMiddleware(app)).bind(null, route));
        }
    }

    public register(subPath: string, method: string, definition: (ctx: NextContextBase) => Promise<any>) {
        return this.app.express[method](subPath, (this.routeMiddleware(this.app)).bind(null, definition));
    }

    private routeMiddleware(app: NextApplication) {
        return async (route: NextRouteAction, req: Request, res: Response, next: NextFunction) => {
            var ctx: NextContextBase = new NextContextBase(req, res, next);

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
                    (ctx as any)[plugin.name] = await plugin.retrieve.call(plugin, ctx);
                }
            }

            // ? Permission
            if (app.options.authorization) {
                if (!await app.options.authorization.check(ctx, route.permission)) {
                    res.status(403).json(new ApiResponse().setError("Forbidden"))
                    return;
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

            // ? Execution
            var result : any = route.default(ctx);
            var isError = false;
            if (result instanceof Promise) {
                result = await result.catch((err) => {
                    isError = true;
                    app.log.error(err);
                });
            }
            if (result instanceof NextRouteResponse) {
                if (result.hasBody) {
                    if (result.body instanceof Stream) {
                        res.status(result.statusCode);
                        for (var header in result.headers) {
                            res.setHeader(header, result.headers[header]);
                        }
                        result.body.pipe(res);
                        return;
                    }
                    else {
                        res.status(result.statusCode).send(result.body);
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