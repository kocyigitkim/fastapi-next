import WebSocket from 'ws';
import fs from 'fs'
import path from 'path'
import { NextContextBase } from "../NextContext";
import { checkPathsByNormalization } from "../utils";
import { NextSocketMessageBase } from "./NextSocketMessageBase";
import { NextSocketContext } from "./NextSocketContext";
import { NextSocketRoute } from "./NextSocketRoute";


export class NextSocketRouter {
    public routes: NextSocketRoute[] = [];
    public registerRoute(route: NextSocketRoute) {
        this.routes.push(route);
    }
    public async handleMessage(ctx: NextContextBase, message: NextSocketMessageBase, socket: WebSocket) {
        var route = this.routes.find(r => checkPathsByNormalization(r.path, message.path));
        var sctx = new NextSocketContext(message, socket);
        if (route) {
            await route.action.call(route, ctx, sctx).catch(console.error);
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
        for (var dir of dirs) {
            var files = fs.readdirSync(dir, { withFileTypes: true });
            for (var file of files) {
                if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.ts'))) {
                    var filePath = path.join(dir, file.name);
                    var route = require(filePath);
                    if (route.default) {
                        this.registerRoute(route.default);
                    }
                    console.log('Register route: ' + path.relative(process.cwd(), filePath));
                }
                else if(file.isDirectory()){
                    this.registerRouters([path.join(dir, file.name)]);
                }
            }
        }
    }
}
