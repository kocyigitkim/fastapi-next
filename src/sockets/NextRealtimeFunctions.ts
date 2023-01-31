import WebSocket from "ws";
import { NextApplication } from "../NextApplication";
import { NextSocketContext } from "./NextSocketContext";
import { NextSocketMessageBase } from "./NextSocketMessageBase";

export class NextRealtimeFunctions {
    public constructor(public app: NextApplication) {
    }
    public async getConnections() {
        return this.app.socket.getConnections();
    }
    public async selectClients(props: {
        [key: string]: any
    }) {
        const clients = this.app.socket.getConnections();
        const selected = clients.filter(client => {
            for (const key in props) {
                if (client[key] !== props[key]) return false;
            }
            return true;
        });
        return Array.isArray(selected) && selected.length > 0 ? selected : [];
    }
    public async send(message: NextSocketMessageBase, client: WebSocket) {
        const ctx = new NextSocketContext(this.app, message, client);
        ctx.sendRequest(message.path, message.body);
    }
    public async broadcast(message: NextSocketMessageBase) {
        this.app.socket.getConnections().forEach(socket => {
            const ctx = new NextSocketContext(this.app, message, socket.socket);
            ctx.sendRequest(message.path, message.body);
        });
    }
    public async broadcastTo(message: NextSocketMessageBase, clients: WebSocket[]) {
        clients.forEach(client => {
            const ctx = new NextSocketContext(this.app, message, client);
            ctx.sendRequest(message.path, message.body);
        });
    }
    public async sendEvent(name: string, parameters: any[]) {
        this.app.socket.getConnections().forEach(socket => {
            const ctx = new NextSocketContext(this.app, null, socket.socket);
            ctx.sendEvent(name, parameters);
        });
    }
}