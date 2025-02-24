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
const YupVisitor_1 = require("../reflection/YupVisitor");
const crypto_1 = require("crypto");
const ConfigurationReader_1 = require("../config/ConfigurationReader");
class NextRouteBuilder {
    constructor(app) {
        this.app = app;
        this.paths = [];
        this.registeredRoutes = [];
        const isScanDirectoryDisabled = Boolean(process.env.DISABLE_SCAN_ROUTERS);
        this.handleHealthCheckEndpoints = this.handleHealthCheckEndpoints.bind(this);
        this.paths = app.options.routerDirs;
        if (!isScanDirectoryDisabled) {
            this.paths.forEach(p => {
                try {
                    var results = this.scanDir(p);
                    results.forEach(({ routePath, realpath }) => {
                        this.registerRoute(p, routePath, app, realpath);
                    });
                }
                catch (err) {
                    console.error(err);
                }
            });
        }
        const glob = global;
        if (Array.isArray(glob.__fastapi_routes_rest)) {
            glob.__fastapi_routes_rest.forEach((route) => {
                this.register(route.details.routePath, route.details.detectedMethod, route.init());
            });
        }
        this.handleHealthCheckEndpoints();
    }
    handleHealthCheckEndpoints() {
        if (this.app.options.healthCheck) {
            // Liveness check
            var isFirstInit = false;
            this.registerAnonymous(this.app.options.healthCheck.livenessPath, "get", async (ctx) => {
                try {
                    if (isFirstInit)
                        return new NextRouteResponse_1.NextRouteResponse(200, "OK", true);
                    const plugins = this.app.registry.getPlugins();
                    const pluginHealths = await Promise.all(plugins.map(p => p.healthCheck(this.app)));
                    const objectHealths = await this.app.healthProfiler.healthCheck();
                    if (this.app.options.debug) {
                        console.log('Health Check', pluginHealths, objectHealths);
                    }
                    const hasError = pluginHealths.some(h => !h.success) || objectHealths.some(h => !h.status.success);
                    if (hasError) {
                        return new NextRouteResponse_1.NextRouteResponse(503, JSON.stringify(pluginHealths, null, 2), true);
                    }
                    else {
                        isFirstInit = true;
                        return new NextRouteResponse_1.NextRouteResponse(200, "OK", true);
                    }
                }
                catch (err) {
                    return new NextRouteResponse_1.NextRouteResponse(503, err.message, true);
                }
            });
            // Readiness check
            this.registerAnonymous(this.app.options.healthCheck.readinessPath, "get", async (ctx) => {
                try {
                    const plugins = this.app.registry.getPlugins();
                    const pluginHealths = await Promise.all(plugins.map(p => p.healthCheck(this.app)));
                    const objectHealths = await this.app.healthProfiler.healthCheck();
                    const hasError = pluginHealths.some(h => !h.success) || objectHealths.some(h => !h.status.success);
                    if (this.app.options.debug) {
                        console.log('Health Check', pluginHealths, objectHealths);
                    }
                    if (hasError) {
                        return new NextRouteResponse_1.NextRouteResponse(503, JSON.stringify({
                            plugins: pluginHealths.map((h, i) => {
                                return {
                                    plugin: plugins[i].name,
                                    success: h.success,
                                    message: h.message
                                };
                            })
                        }, null, 2), true);
                    }
                    else {
                        return new NextRouteResponse_1.NextRouteResponse(200, "OK", true);
                    }
                }
                catch (err) {
                    return new NextRouteResponse_1.NextRouteResponse(503, err.message, true);
                }
            });
        }
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
        var route = typeof (realpath) === 'string' ? require(realpath) : realpath;
        app.express[httpMethod](expressRoutePath, (this.routeMiddleware(app)).bind(null, route));
        this.registeredRoutes.push({ path: expressRoutePath, action: route, method: httpMethod, requestSchema: YupVisitor_1.YupVisitor.parseYupSchema(route.validate) });
        if (parts.length > 1 && parts[parts.length - 1] === "index" || parts[0] === "index") {
            const modifiedPath = expressRoutePath.substring(0, expressRoutePath.length - "index".length);
            app.express[httpMethod](modifiedPath, (this.routeMiddleware(app)).bind(null, route));
            this.registeredRoutes.push({
                path: modifiedPath,
                action: route,
                method: httpMethod,
                requestSchema: YupVisitor_1.YupVisitor.parseYupSchema(route.validate)
            });
        }
    }
    register(subPath, method, definition) {
        method = (method || "get").toLowerCase();
        let action = {
            default: definition,
            description: definition.description,
            summary: definition.summary,
            tags: definition.tags,
            deprecated: definition.deprecated,
            middlewares: definition.middlewares,
            permission: definition.permission
        };
        var res = this.app.express[method](subPath, (this.routeMiddleware(this.app)).bind(null, action));
        this.registeredRoutes.push({
            path: subPath,
            action: action,
            method: method,
            requestSchema: YupVisitor_1.YupVisitor.parseYupSchema(definition.validate),
        });
        return res;
    }
    registerAction(subPath, method, action) {
        method = (method || "get").toLowerCase();
        var res = this.app.express[method](subPath, (this.routeMiddleware(this.app)).bind(null, action));
        this.registeredRoutes.push({
            path: subPath,
            action: action,
            method: method
        });
        return res;
    }
    registerAnonymous(subPath, method, definition) {
        let def = definition;
        def.permission = {
            anonymous: true
        };
        return this.register(subPath, method, def);
    }
    routeMiddleware(app) {
        return async (route, req, res, next) => {
            var _a, _b, _c;
            var ctx = new __1.NextContextBase(req, res, next);
            ctx.app = app;
            ctx.route = route;
            const executeMiddleware = route.middlewares && ExecuteMiddleware(ctx, app);
            for (var plugin of app.registry.getPlugins()) {
                var mwResult = await plugin.middleware.call(plugin, ctx).catch(app.log.error);
                if (typeof mwResult === 'boolean' && !mwResult) {
                    break;
                }
                else if (typeof mwResult === 'number') {
                    if (mwResult === NextFlag_1.NextFlag.Exit) {
                        return;
                    }
                    else if (mwResult === NextFlag_1.NextFlag.Next) {
                        next();
                        return;
                    }
                }
                if (plugin.showInContext) {
                    var retrieveResult = plugin.retrieve.call(plugin, ctx);
                    if (retrieveResult instanceof Promise) {
                        retrieveResult = await retrieveResult.catch(app.log.error);
                    }
                    ctx[plugin.name] = retrieveResult;
                }
            }
            // ? Middleware specific to route
            if (Array.isArray((_a = route === null || route === void 0 ? void 0 : route.middlewares) === null || _a === void 0 ? void 0 : _a.beforeExecution)) {
                var mwResult = await executeMiddleware(next, route.middlewares.beforeExecution);
                if (typeof mwResult === 'boolean' && !mwResult) {
                    return;
                }
                else if (typeof mwResult === 'number') {
                    if (mwResult === NextFlag_1.NextFlag.Exit || mwResult === NextFlag_1.NextFlag.Next) {
                        return;
                    }
                }
            }
            // ? Realtime Configuration
            if (app.options.enableRealtimeConfig) {
                ctx.config = ConfigurationReader_1.ConfigurationReader.current;
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
                else if (typeof route.validate === 'object') {
                    var validateSchema = route.validate;
                    var isError = false;
                    var result = await validateSchema.validate(ctx.all).catch((err) => {
                        isError = true;
                        return err;
                    });
                    if (isError) {
                        var yupResult = new ValidationResult_1.ValidationResult();
                        var yupError = result;
                        yupResult.error(yupError.path, yupError.message);
                        res.status(400).json(new __1.ApiResponse(false, "validation error!", yupResult));
                        return;
                    }
                    else {
                        ctx.body = result;
                    }
                }
            }
            // ? Middleware to execute after validation
            if (Array.isArray((_b = route === null || route === void 0 ? void 0 : route.middlewares) === null || _b === void 0 ? void 0 : _b.afterValidation)) {
                var mwResult = await executeMiddleware(next, route.middlewares.afterValidation);
                if (typeof mwResult === 'boolean' && !mwResult) {
                    return;
                }
                else if (typeof mwResult === 'number') {
                    if (mwResult === NextFlag_1.NextFlag.Exit || mwResult === NextFlag_1.NextFlag.Next) {
                        return;
                    }
                }
            }
            // ? Run disposeInstance for all registered plugins
            for (var plugin of app.registry.getPlugins()) {
                try {
                    var disposeResult = plugin.disposeInstance.call(plugin, ctx);
                    if (disposeResult instanceof Promise) {
                        disposeResult = await disposeResult.catch(app.log.error);
                    }
                }
                catch (ex) {
                    app.log.error(ex);
                }
            }
            // ? Permission
            if (app.options.authorization) {
                if (!await app.options.authorization.check(ctx, route.permission)) {
                    res.status(403).json(new __1.ApiResponse().setError("Forbidden"));
                    return;
                }
            }
            // ? Execution
            var result = route.default(ctx);
            var isError = false;
            var statusCode = 200;
            if (result instanceof Promise) {
                result = await result.catch((err) => {
                    isError = true;
                    var errorId = (0, crypto_1.randomUUID)();
                    app.log.error(`${errorId} - ${err}`);
                    return `Internal Server Error! Error Code: ${errorId}`;
                });
            }
            if (isError) {
                statusCode = 500;
            }
            // ? Middleware to execute after execution
            if (Array.isArray((_c = route === null || route === void 0 ? void 0 : route.middlewares) === null || _c === void 0 ? void 0 : _c.afterExecution)) {
                var mwResult = await executeMiddleware(next, route.middlewares.afterExecution);
                if (typeof mwResult === 'boolean' && !mwResult) {
                    return;
                }
                else if (typeof mwResult === 'number') {
                    if (mwResult === NextFlag_1.NextFlag.Exit || mwResult === NextFlag_1.NextFlag.Next) {
                        return;
                    }
                }
            }
            if (result instanceof __1.ApiResponse) {
                if (result.$statusCode) {
                    statusCode = result.$statusCode;
                    delete result.$statusCode;
                }
            }
            if (result instanceof NextRouteResponse_1.NextRouteResponse) {
                if (result.statusCode == NextRouteResponse_1.NextRouteResponseStatus.REDIRECT) {
                    res.redirect(result.statusCode, result.body);
                    return;
                }
                if (result.hasBody) {
                    res.status(result.statusCode);
                    for (var header in result.headers) {
                        res.setHeader(header, result.headers[header]);
                    }
                    if (result.body instanceof stream_1.Stream) {
                        result.body.pipe(res);
                        return;
                    }
                    else {
                        res.send(result.body);
                        return;
                    }
                }
                else {
                    res.status(result.statusCode).end();
                    return;
                }
            }
            else if (result == NextFlag_1.NextFlag.Exit) {
                return;
            }
            else if (result == NextFlag_1.NextFlag.Next) {
                next();
                return;
            }
            else {
                if (isError) {
                    if (typeof result === 'string') {
                        res.status(statusCode).send(result);
                    }
                    else {
                        res.set("Content-Type", "application/json");
                        res.status(statusCode).json(result);
                    }
                }
                else {
                    res.set("Content-Type", "application/json");
                    res.status(statusCode).json(result);
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
function ExecuteMiddleware(ctx, app) {
    return async (next, middlewares) => {
        for (const middleware of middlewares) {
            var result = middleware(ctx);
            if (result && result instanceof Promise) {
                result = await result.catch(app.log.error);
            }
            if (typeof result === 'boolean' && !result) {
                break;
            }
            else if (typeof result === 'number') {
                if (result === NextFlag_1.NextFlag.Exit) {
                    return NextFlag_1.NextFlag.Exit;
                }
                else if (result === NextFlag_1.NextFlag.Next) {
                    next();
                    return NextFlag_1.NextFlag.Next;
                }
            }
        }
    };
}
