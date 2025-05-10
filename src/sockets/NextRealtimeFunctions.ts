import WebSocket from "ws";
import { NextApplication } from "../NextApplication";
import { NextSocketClient } from "./NextSocketClient";
import { NextSocketContext } from "./NextSocketContext";
import { NextSocketMessageBase } from "./NextSocketMessageBase";

export class NextRealtimeFunctions {
    public constructor(public app: NextApplication) {
    }
    public async getConnections() {
        return this.app.socket.getConnections();
    }
    public getClient(socket: WebSocket): NextSocketClient {
        return this.app.socket.getConnections().find(client => client.socket == socket);
    }
    public async selectClients(props: {
        [key: string]: any
    } | Function) {
        const clients = this.app.socket.getConnections();
        const selected = clients.filter(client => {
            if (typeof props == 'function') {
                return props(client.getProps());
            }
            else {
                for (const key in props) {
                    if (client.get(key) !== props[key]) return false;
                }
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
        // If Redis adapter is available, use it for broadcasting
        if (this.app.socket && this.app.socket['redisAdapter']) {
            try {
                await this.app.socket['redisAdapter'].broadcastMessage(message);
                return;
            } catch (err) {
                this.app.emit('error', err);
                // Fall back to local broadcast if Redis fails
            }
        }
        
        // Local broadcast
        this.app.socket.getConnections().forEach(socket => {
            const ctx = new NextSocketContext(this.app, message, socket.socket);
            ctx.sendRequest(message.path, message.body);
        });
    }
    public async broadcastTo(message: NextSocketMessageBase, clients: (WebSocket | NextSocketClient)[]) {
        clients.forEach(client => {
            const ctx = new NextSocketContext(this.app, message, client instanceof NextSocketClient ? client.socket : client);
            ctx.sendRequest(message.path, message.body);
        });
    }
    public async sendEvent(name: string, parameters: any[]) {
        this.app.socket.getConnections().forEach(socket => {
            const ctx = new NextSocketContext(this.app, null, socket.socket);
            ctx.sendEvent(name, parameters);
        });
    }
    // Room methods - Socket.io-like functionality
    public async joinRoom(client: WebSocket | NextSocketClient | string, room: string) {
        if (!this.app.socket) return;
        
        const clientId = typeof client === 'string' 
            ? client 
            : (client instanceof NextSocketClient 
                ? client.id 
                : this.getClient(client)?.id);
                
        if (clientId) {
            await this.app.socket.joinRoom(clientId, room);
        }
    }
    
    public async leaveRoom(client: WebSocket | NextSocketClient | string, room: string) {
        if (!this.app.socket) return;
        
        const clientId = typeof client === 'string' 
            ? client 
            : (client instanceof NextSocketClient 
                ? client.id 
                : this.getClient(client)?.id);
                
        if (clientId) {
            await this.app.socket.leaveRoom(clientId, room);
        }
    }
    
    public async broadcastToRoom(room: string, message: NextSocketMessageBase, excludedClients: (WebSocket | NextSocketClient | string)[] = []) {
        if (!this.app.socket) return;
        
        // Convert excluded clients to IDs
        const excludedIds = excludedClients.map(client => 
            typeof client === 'string' 
                ? client 
                : (client instanceof NextSocketClient 
                    ? client.id 
                    : this.getClient(client)?.id)
        ).filter(Boolean);
        
        await this.app.socket.broadcastToRoom(room, message, excludedIds);
    }
    
    public async getRoomMembers(room: string): Promise<string[]> {
        if (!this.app.socket) return [];
        
        return await this.app.socket.getRoomMembers(room);
    }
}