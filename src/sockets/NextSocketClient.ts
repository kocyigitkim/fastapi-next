import { randomUUID } from 'crypto';
import { WebSocket } from 'ws'
import { NextContextBase } from "../NextContext";


export class NextSocketClient {
    public socket: WebSocket;
    public context: NextContextBase;
    public id: string;
    private props: any = {};
    public get(key: string) {
        return this.props[key];
    }
    public set(key: string, value: any) {
        this.props[key] = value;
    }
    public has(key: string) {
        return Boolean(this.props[key]);
    }

    public constructor(socket: WebSocket, context: NextContextBase) {
        this.socket = socket;
        this.context = context;
        this.id = randomUUID();
    }
}