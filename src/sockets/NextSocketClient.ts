import { randomUUID } from 'crypto';
import { WebSocket } from 'ws'
import { NextContextBase } from "../NextContext";


export class NextSocketClient {
    public socket: WebSocket;
    public context: NextContextBase;
    public id: string;
    private props: any = {};
    private rooms: Set<string> = new Set();
    
    public getProps(){
        return this.props;
    }
    
    public get(key: string) {
        return this.props[key];
    }
    
    public set(key: string, value: any) {
        this.props[key] = value;
    }
    
    public has(key: string) {
        return Boolean(this.props[key]);
    }
    
    public isInRoom(room: string): boolean {
        return this.rooms.has(room);
    }
    
    public joinRoom(room: string) {
        this.rooms.add(room);
    }
    
    public leaveRoom(room: string) {
        this.rooms.delete(room);
    }
    
    public getRooms(): string[] {
        return Array.from(this.rooms);
    }

    public constructor(socket: WebSocket, context: NextContextBase) {
        this.socket = socket;
        this.context = context;
        this.id = randomUUID();
    }
}