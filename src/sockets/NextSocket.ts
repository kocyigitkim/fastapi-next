import { NextApplication } from "..";
import WebSocket, { WebSocketServer } from 'ws'
import { NextContextBase } from "../NextContext";
import { NextSocketRouter } from "./NextSocketRouter";
import { NextSocketOptions } from "./NextSocketOptions";
import { NextSocketMessageBase } from "./NextSocketMessageBase";

export class NextSocket {
    public server: WebSocketServer;
    public router: NextSocketRouter;
    constructor(public options: NextSocketOptions, public app: NextApplication) {
        this.start = this.start.bind(this);
        this.registerEvents = this.registerEvents.bind(this);
        app.on('start', (app: NextApplication) => {
            this.start();
        })
    }
    private async start() {
        this.server = new WebSocketServer({
            ...this.options,
            server: this.app.server
        });

        this.registerEvents();
    }
    private async registerEvents() {
        this.server.on('error', (err: Error) => {
            this.app.emit('error', err);
        })

        this.server.on('connection', async (socket, req) => {
            var ctx = new NextContextBase(req as any, null, () => { });
            for (var plugin of this.app.registry.getPlugins()) {
                if (plugin.showInContext) {
                    (ctx as any)[plugin.name] = await plugin.retrieve.call(plugin, ctx);
                }
            }
            socket.on('message', (data: any) => {
                try {
                    var message = JSON.parse(data);
                    this.router.handleMessage(ctx, message, socket);
                } catch (err) {
                    this.app.emit('error', err);
                }
            });
            socket.on('error', (err: Error) => {
                this.app.emit('error', err);
            });
        })
    }
}


