import { NextApplication } from "..";
import WebSocket, { WebSocketServer } from 'ws'
import { NextContextBase } from "../NextContext";
import { NextSocketRouter } from "./NextSocketRouter";
import { NextSocketOptions } from "./NextSocketOptions";
import { NextSocketContext } from "./NextSocketContext";
import { NextSocketClient } from "./NextSocketClient";
import { randomUUID } from "crypto";
import { NextSocketRedisAdapter } from "./NextSocketRedisAdapter";
import { NextSocketRedisOptions } from "./NextSocketRedisOptions";

export class NextSocket {
    public server: WebSocketServer;
    public router: NextSocketRouter;
    private connections: NextSocketClient[];
    private redisAdapter?: NextSocketRedisAdapter;
    
    public getConnections() {
        return this.connections;
    }
    
    constructor(public options: NextSocketOptions, public app: NextApplication) {
        this.connections = [];
        this.start = this.start.bind(this);
        this.registerEvents = this.registerEvents.bind(this);
        
        app.on('start', (app: NextApplication) => {
            this.start();
        });
        
        app.on('stop', async () => {
            await this.stop();
        });
    }
    
    private async stop() {
        if (this.redisAdapter) {
            await this.redisAdapter.destroy();
        }
    }
    
    private async start() {
        // Initialize Redis adapter if configured
        if (this.options.redis?.enabled) {
            this.initRedisAdapter();
        }
        
        this.server = new WebSocketServer({
            ...this.options,
            server: this.app.server
        });

        this.registerEvents();
    }
    
    private async initRedisAdapter() {
        if (!this.options.redis) return;
        
        // Use options from config or environment
        const redisOptions = this.options.redis || NextSocketRedisOptions.fromEnv();
        
        if (redisOptions.enabled) {
            this.redisAdapter = new NextSocketRedisAdapter(
                this.app,
                this,
                redisOptions.redisOptions
            );
            
            try {
                await this.redisAdapter.init();
                this.app.log.info('Redis adapter for sockets initialized successfully');
            } catch (err) {
                this.app.emit('error', err);
                this.app.log.error('Failed to initialize Redis adapter for sockets');
            }
        }
    }
    
    private async registerEvents() {
        this.server.on('error', (err: Error) => {
            this.app.emit('error', err);
        });

        this.server.on('connection', async (socket, req) => {
            var ctx = new NextContextBase(req as any, null, () => { });
            ctx.app = this.app;
            ctx.sessionManager = this.app.sessionManager;
            for (var plugin of this.app.registry.getPlugins()) {
                if (plugin.showInContext) {
                    (ctx as any)[plugin.name] = await plugin.retrieve.call(plugin, ctx);
                }
            }
            let client = new NextSocketClient(socket, ctx);
            this.connections.push(client);
            
            // Handle connection with Redis rooms if adapter is enabled
            if (this.redisAdapter) {
                // Track client in Redis
                const connectionData = {
                    id: client.id,
                    timestamp: Date.now(),
                    ip: req.socket.remoteAddress,
                    userAgent: req.headers['user-agent']
                };
                
                try {
                    await this.redisAdapter.publish('client:connect', connectionData);
                } catch (err) {
                    this.app.emit('error', err);
                }
            }
            
            socket.on('message', (data: any) => {
                try {
                    var message = JSON.parse(data);
                    ctx.sessionId = message.sessionid;
                    if (ctx.sessionId) delete message.sessionid;
                    
                    // Handle room operations if needed
                    if (message.type === 'socket.room' && message.action) {
                        this.handleRoomOperation(client, message);
                        return;
                    }
                    
                    this.router.handleMessage(ctx, message, socket);
                } catch (err) {
                    this.app.emit('error', err);
                }
            });
            
            socket.on('error', (err: Error) => {
                this.app.emit('error', err);
            });
            
            socket.on('close', async () => {
                // Handle disconnection with Redis rooms if adapter is enabled
                if (this.redisAdapter) {
                    try {
                        // Get all rooms this client is in and leave them
                        const clientRooms = client.getRooms();
                        for (const room of clientRooms) {
                            await this.redisAdapter.leaveRoom(client.id, room);
                        }
                        
                        // Notify about disconnection
                        await this.redisAdapter.publish('client:disconnect', {
                            id: client.id,
                            timestamp: Date.now()
                        });
                    } catch (err) {
                        this.app.emit('error', err);
                    }
                }
                
                this.connections = this.connections.filter(c => c !== client);
            });
        });
    }
    
    private async handleRoomOperation(client: NextSocketClient, message: any) {
        try {
            if (message.action === 'join' && message.room) {
                await this.joinRoom(client.id, message.room);
                client.joinRoom(message.room);
                client.socket.send(JSON.stringify({
                    type: 'socket.room',
                    action: 'join',
                    room: message.room,
                    success: true
                }));
            } else if (message.action === 'leave' && message.room) {
                await this.leaveRoom(client.id, message.room);
                client.leaveRoom(message.room);
                client.socket.send(JSON.stringify({
                    type: 'socket.room',
                    action: 'leave',
                    room: message.room,
                    success: true
                }));
            } else if (message.action === 'list') {
                const rooms = client.getRooms();
                client.socket.send(JSON.stringify({
                    type: 'socket.room',
                    action: 'list',
                    rooms,
                    success: true
                }));
            }
        } catch (err) {
            this.app.emit('error', err);
            client.socket.send(JSON.stringify({
                type: 'socket.room',
                action: message.action,
                room: message.room,
                success: false,
                error: err.message
            }));
        }
    }
    
    // Room methods for Socket.io-like functionality
    public async joinRoom(clientId: string, room: string) {
        if (this.redisAdapter) {
            await this.redisAdapter.joinRoom(clientId, room);
        }
    }
    
    public async leaveRoom(clientId: string, room: string) {
        if (this.redisAdapter) {
            await this.redisAdapter.leaveRoom(clientId, room);
        }
    }
    
    public async broadcastToRoom(room: string, message: any, excludedClients: string[] = []) {
        if (this.redisAdapter) {
            await this.redisAdapter.broadcastToRoom(room, message, excludedClients);
        } else {
            // Local room implementation if no Redis
            const members = await this.getRoomMembers(room);
            const connections = this.getConnections();
            
            for (const client of connections) {
                if (members.includes(client.id) && !excludedClients.includes(client.id)) {
                    try {
                        client.socket.send(JSON.stringify(message));
                    } catch (err) {
                        this.app.emit('error', err);
                    }
                }
            }
        }
    }
    
    public async getRoomMembers(room: string): Promise<string[]> {
        if (this.redisAdapter) {
            return await this.redisAdapter.getRoomMembers(room);
        }
        
        // Local implementation if no Redis
        return [];
    }
}
