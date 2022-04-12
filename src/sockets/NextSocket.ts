import { NextApplication } from "..";
import WebSocket, { Server } from 'ws'
import { NextContextBase } from "../NextContext";
import { NextSocketRouter } from "./NextSocketRouter";
import { NextSocketOptions } from "./NextSocketOptions";
import { NextSocketMessageBase } from "./NextSocketMessageBase";

export class NextSocket {
    public server: Server;
    public router: NextSocketRouter;
    constructor(public options: NextSocketOptions, public app: NextApplication) {
        this.start = this.start.bind(this);
        this.registerEvents = this.registerEvents.bind(this);
        app.on('start', (app: NextApplication) => {
            this.start();
        })
    }
    private async start() {
        this.server = new Server({
            ...this.options,
            server: this.app.server
        });

        this.registerEvents();

        this.app.server.on('upgrade', (req: any, socket: any, head: any) => {
            this.server.handleUpgrade(req, socket, head, (ws: WebSocket) => {
                this.server.emit('connection', ws, req);
            });
        })
    }
    private async registerEvents() {
        this.server.on('connection', async (socket, req) => {
            var ctx = new NextContextBase(req as any, null, () => { });
            for (var plugin of this.app.registry.getPlugins()) {
                if (plugin.showInContext) {
                    (ctx as any)[plugin.name] = await plugin.retrieve.call(plugin, ctx);
                }
            }
            socket.on('message', (data: any) => {
                try {
                    var message: NextSocketMessageBase = JSON.parse(data);
                    if (this.app.options.debug) {
                        this.app.log.info(`${message.type} - ${message.path} - message received on socket`);
                    }
                    this.router.handleMessage(ctx, message, socket);
                } catch (err) {
                    this.app.log.error(err);
                }
            });
        })
    }
}


