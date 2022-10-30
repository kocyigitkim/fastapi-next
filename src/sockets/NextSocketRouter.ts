import WebSocket from 'ws';
import fs from 'fs'
import path from 'path'
import { NextContextBase } from "../NextContext";
import { checkPathsByNormalization } from "../utils";
import { NextSocketMessageBase } from "./NextSocketMessageBase";
import { NextSocketContext } from "./NextSocketContext";
import { NextSocketRoute } from "./NextSocketRoute";
import { NextSocketAction } from './NextSocketAction';


export class NextSocketRouter {
    public routes: NextSocketRoute[] = [];
    public registerRoute(path: string, action: NextSocketAction) {
        this.routes.push({
            action: action,
            path: path
        });
    }
    public async handleMessage(ctx: NextContextBase, message: NextSocketMessageBase, socket: WebSocket) {
        var route = this.routes.find(r => checkPathsByNormalization(r.path, message.path));
        var sctx = new NextSocketContext(message, socket);
        if (route) {
            if (ctx.sessionId) {
                (ctx as any).session = await ctx.sessionManager.retrieveSession(ctx.sessionId).catch(ctx.app.log.error);
            }
            var response = await route.action.call(route, ctx, sctx).catch(console.error);
            sctx.send(response);
        }
        else {
            sctx.send({
                type: 'error',
                message: 'Route not found',
                path: message.path
            });
        }
    }
    public async registerRouters(dirs: string[]) {
        const isScanDirectoryDisabled = Boolean(process.env.DISABLE_SCAN_ROUTERS);
        if (!isScanDirectoryDisabled) {
            for (var dir of dirs) {
                try {
                    var files: {
                        routepath: string;
                        realpath: string;
                    }[] = this.scanDir(dir);
                    for (var file of files) {
                        var parts = path.relative(dir, file.realpath).split(path.sep);
                        var methodPath = "/" + parts.map(part => {
                            return part.replace(/\[/g, ":").replace(/\]/g, "");
                        }).join("/");
                        var fileExtension = path.basename(methodPath).split(".")[1];
                        if (fileExtension) {
                            methodPath = methodPath.substring(0, methodPath.length - fileExtension.length - 1);
                        }
                        var route = require(file.realpath);
                        if (route.default) {
                            this.registerRoute(methodPath, route.default);
                        }
                        console.log('Register socket route: ' + methodPath);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }

        const glob = (global as any);
        if (Array.isArray(glob.__fastapi_routes_ws)) {
            glob.__fastapi_routes_ws.forEach((route: any) => {
                this.registerRoute(route.details.routePath, route.init());
            });
        }
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
