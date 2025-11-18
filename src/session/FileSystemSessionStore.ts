import { ISessionStore } from "./ISessionStore";
import fs from 'fs'
import { NextHealthCheckStatus } from "../config/NextOptions";

export class FileSystemSessionStore extends ISessionStore {
    public rootPath: string;
    public ttl?: number;
    constructor(rootPath: string, ttl?: number) {
        super();
        this.rootPath = rootPath;
        this.ttl = ttl;
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    async healthCheck(): Promise<NextHealthCheckStatus> {
        return NextHealthCheckStatus.Alive();
    }
    async get(id, callback) {
        var filePath = this.rootPath + "/" + id;
        try {
            // Use async stat to check file existence and age
            const stat = await fs.promises.stat(filePath);
            if (stat.isFile()) {
                var ttl = this.ttl;
                if (ttl) {
                    var now = new Date();
                    var fileAge = now.valueOf() - stat.mtime.valueOf();
                    if (fileAge > ttl) {
                        await fs.promises.unlink(filePath);
                        if (callback) callback("Session expired", null);
                        return;
                    }
                }
            }
            const data = await fs.promises.readFile(filePath, 'utf8');
            const parsed = JSON.parse(data);
            if (callback)
                callback(null, parsed);
        } catch (err) {
            // File doesn't exist or can't be read
            if (callback)
                callback("Session not exists", null);
        }
    }
    async set(id, value, callback) {
        var filePath = this.rootPath + "/" + id;
        var data = JSON.stringify(value);
        await fs.promises.writeFile(filePath, data);
        if (callback)
            callback(null, value);
    }
    async destroy(id, callback) {
        var filePath = this.rootPath + "/" + id;
        try {
            await fs.promises.unlink(filePath);
            if (callback)
                callback(null, this);
        } catch (err) {
            // File doesn't exist, ignore error
            if (callback)
                callback(null, this);
        }
    }
}
