"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextRouteBuilder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const __1 = require("..");
const NextFlag_1 = require("../NextFlag");
const ValidationResult_1 = require("../validation/ValidationResult");
const NextRouteResponse_1 = require("./NextRouteResponse");
class NextRouteBuilder {
    constructor(app) {
        this.paths = [];
        this.paths = app.options.routerDirs;
        this.paths.forEach(p => {
            var results = this.scanDir(p);
            results.forEach(({ routePath, realpath }) => {
                this.registerRoute(p, routePath, app, realpath);
            });
        });
    }
    registerRoute(p, routePath, app, realpath) {
        var parts = path_1.default.relative(p, routePath).split(path_1.default.sep);
        var expressRoutePath = "/" + parts.map(part => {
            return part.replace(/\[/g, ":").replace(/\]/g, "");
        }).join("/");
        var specificMethod = path_1.default.basename(expressRoutePath).split(".")[1];
        var httpMethod = expressRoutePath.indexOf(":") > -1 ? "get" : (specificMethod || "get");
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
    routeMiddleware(app) {
        return async (route, req, res, next) => {
            var ctx = new __1.NextContextBase(req, res, next);
            for (var plugin of app.registry.getPlugins()) {
                var mwResult = await plugin.middleware.call(plugin, ctx).catch(app.log.error);
                if (typeof mwResult === 'boolean' && !mwResult) {
                    break;
                }
                else if (typeof mwResult === 'number') {
                    if (mwResult === NextFlag_1.NextFlag.Exit) {
                        return;
                    }
                }
                if (plugin.showInContext) {
                    ctx[plugin.name] = await plugin.retrieve.call(plugin, ctx);
                }
            }
            if (route.validate) {
                try {
                    var validationResult = route.validate(ctx);
                    if (validationResult instanceof Promise) {
                        validationResult = await validationResult.catch(app.log.error);
                    }
                    if (!validationResult || !validationResult.success) {
                        res.status(500).json(new __1.ApiResponse(false, "validation error!", validationResult));
                        return;
                    }
                }
                catch (err) {
                    app.log.error(err);
                    var errorResult = new ValidationResult_1.ValidationResult();
                    errorResult.error("err", (err || new Error()).toString());
                    res.status(500).json(new __1.ApiResponse(false, "validation error!", errorResult));
                    return;
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
            if (result instanceof NextRouteResponse_1.NextRouteResponse) {
                if (result.hasBody) {
                    if (result.body instanceof stream_1.Stream) {
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
                }
                else {
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
    scanDir(scanPath) {
        if (!scanPath)
            return null;
        var files = [];
        fs_1.default.readdirSync(scanPath, {
            withFileTypes: true
        }).forEach(dir => {
            if (dir.isDirectory()) {
                this.scanDir(path_1.default.join(scanPath, dir.name)).forEach(f => {
                    files.push(f);
                });
            }
            else {
                if (dir.name.endsWith('.ts') || dir.name.endsWith('.js')) {
                    files.push({
                        routePath: path_1.default.join(scanPath, path_1.default.basename(dir.name, path_1.default.extname(dir.name))),
                        realpath: path_1.default.join(scanPath, dir.name)
                    });
                }
            }
        });
        return files;
    }
}
exports.NextRouteBuilder = NextRouteBuilder;
