import { createClient } from 'redis';
import { NextApplication } from '..';
import { NextSocketClient } from './NextSocketClient';
import { NextSocketMessageBase } from './NextSocketMessageBase';
import { NextSocket } from './NextSocket';
import { randomUUID } from 'crypto';

export class NextSocketRedisAdapter {
    private subscriberClient: any;
    private publisherClient: any;
    private channelPrefix = 'next:socket:';
    private serverId = randomUUID();
    private initialized = false;
    
    constructor(
        private app: NextApplication,
        private socket: NextSocket,
        private options: any
    ) {
        this.subscriberClient = createClient(options);
        this.publisherClient = createClient(options);
        
        this.subscriberClient.on('error', this.handleError.bind(this));
        this.publisherClient.on('error', this.handleError.bind(this));
    }

    private handleError(err: Error) {
        this.app.emit('error', err);
    }

    public async init() {
        if (this.initialized) return;
        
        try {
            await this.subscriberClient.connect();
            await this.publisherClient.connect();
            
            await this.subscriberClient.subscribe(`${this.channelPrefix}broadcast`, (message) => {
                this.handleBroadcastMessage(message);
            });
            
            await this.subscriberClient.subscribe(`${this.channelPrefix}server:${this.serverId}`, (message) => {
                this.handleServerMessage(message);
            });
            
            this.initialized = true;
            this.app.log.info(`Socket Redis adapter initialized with server ID: ${this.serverId}`);
        } catch (err) {
            this.app.emit('error', err);
        }
    }

    public async destroy() {
        if (!this.initialized) return;
        
        try {
            await this.subscriberClient.unsubscribe(`${this.channelPrefix}broadcast`);
            await this.subscriberClient.unsubscribe(`${this.channelPrefix}server:${this.serverId}`);
            
            await this.subscriberClient.disconnect();
            await this.publisherClient.disconnect();
            
            this.initialized = false;
        } catch (err) {
            this.app.emit('error', err);
        }
    }
    
    public async publish(event: string, data: any, targetServerId?: string) {
        try {
            const payload = JSON.stringify({
                serverId: this.serverId,
                event,
                data,
                timestamp: Date.now()
            });
            
            if (targetServerId) {
                await this.publisherClient.publish(`${this.channelPrefix}server:${targetServerId}`, payload);
            } else {
                await this.publisherClient.publish(`${this.channelPrefix}broadcast`, payload);
            }
        } catch (err) {
            this.app.emit('error', err);
        }
    }
    
    public async broadcastMessage(message: NextSocketMessageBase, excluded: string[] = []) {
        await this.publish('broadcast', {
            message,
            excluded
        });
    }
    
    public async joinRoom(clientId: string, room: string) {
        try {
            await this.publisherClient.sAdd(`${this.channelPrefix}room:${room}`, clientId);
        } catch (err) {
            this.app.emit('error', err);
        }
    }
    
    public async leaveRoom(clientId: string, room: string) {
        try {
            await this.publisherClient.sRem(`${this.channelPrefix}room:${room}`, clientId);
        } catch (err) {
            this.app.emit('error', err);
        }
    }
    
    public async broadcastToRoom(room: string, message: NextSocketMessageBase, excluded: string[] = []) {
        await this.publish('roomBroadcast', {
            room,
            message,
            excluded
        });
    }
    
    public async getRoomMembers(room: string): Promise<string[]> {
        try {
            return await this.publisherClient.sMembers(`${this.channelPrefix}room:${room}`);
        } catch (err) {
            this.app.emit('error', err);
            return [];
        }
    }
    
    private handleBroadcastMessage(message: string) {
        try {
            const data = JSON.parse(message);
            
            // Ignore messages from this server
            if (data.serverId === this.serverId) return;
            
            if (data.event === 'broadcast') {
                this.handleRemoteBroadcast(data.data);
            } else if (data.event === 'roomBroadcast') {
                this.handleRemoteRoomBroadcast(data.data);
            }
        } catch (err) {
            this.app.emit('error', err);
        }
    }
    
    private handleServerMessage(message: string) {
        try {
            const data = JSON.parse(message);
            
            // Handle server-specific messages here
            this.app.log.debug(`Received server-specific message: ${data.event}`);
        } catch (err) {
            this.app.emit('error', err);
        }
    }
    
    private handleRemoteBroadcast(data: any) {
        const { message, excluded } = data;
        const connections = this.socket.getConnections();
        
        for (const client of connections) {
            // Skip excluded clients
            if (excluded && excluded.includes(client.id)) continue;
            
            try {
                client.socket.send(JSON.stringify(message));
            } catch (err) {
                this.app.emit('error', err);
            }
        }
    }
    
    private handleRemoteRoomBroadcast(data: any) {
        const { room, message, excluded } = data;
        
        // We'll need to check which local clients are in this room
        this.publisherClient.sMembers(`${this.channelPrefix}room:${room}`).then(members => {
            const connections = this.socket.getConnections();
            
            for (const client of connections) {
                // Skip if not in room or excluded
                if (!members.includes(client.id)) continue;
                if (excluded && excluded.includes(client.id)) continue;
                
                try {
                    client.socket.send(JSON.stringify(message));
                } catch (err) {
                    this.app.emit('error', err);
                }
            }
        }).catch(err => {
            this.app.emit('error', err);
        });
    }
} 