import WebSocket from 'ws';
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
}
