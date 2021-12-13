"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextRouteBuilder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const __1 = require("..");
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
    routeMiddleware(app) {
        return async (route, req, res, next) => {
            var ctx = new __1.NextContext(req, res, next);
            for (var plugin of app.registry.getPlugins()) {
                if (!plugin.middleware(ctx)) {
                    break;
                }
                if (plugin.showInContext) {
                    ctx[plugin.name] = plugin;
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
                    res.status(result.statusCode).send(result.body);
                }
                else {
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
