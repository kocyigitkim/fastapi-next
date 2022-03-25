import { ISessionStore } from "./ISessionStore";
import fs from 'fs'

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
    async get(id, callback) {
        var filePath = this.rootPath + "/" + id;
        var exists = await new Promise((resolve) => {
            resolve(fs.existsSync(filePath));
        });
        if (exists) {
            // check file age
            var stat: fs.Stats = await new Promise((resolve) => {
                resolve(fs.statSync(filePath));
            });
            if (stat.isFile()) {
                var ttl = this.ttl;
                if (ttl) {
                    var now = new Date();
                    var fileAge = now.valueOf() - stat.mtime.valueOf();
                    if (fileAge > ttl) {
                        await new Promise((resolve) => {
                            fs.unlink(filePath, resolve);
                        });
                        if (callback) callback("Session expired", null);
                        return;
                    }
                }
            }
            var data = await new Promise((resolve) => {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        resolve(null);
                    }
                    else {
                        resolve(JSON.parse(data.toString()));
                    }
                });
            });
            if (callback)
                callback(null, data);
        }
        else {
            if (callback)
                callback("Session not exists", null);
        }
    }
    async set(id, value, callback) {
        var filePath = this.rootPath + "/" + id;
        var data = JSON.stringify(value);
        await new Promise((resolve) => {
            fs.writeFile(filePath, data, resolve);
        });
        if (callback)
            callback(null, this);
    }
    async destroy(id, callback) {
        var filePath = this.rootPath + "/" + id;
        await new Promise((resolve) => {
            fs.unlink(filePath, resolve);
        });
        if (callback)
            callback(null, this);
    }
}
