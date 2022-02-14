import path from "path";
import { Stream } from "stream";
import fs from "fs";

export class FileSystemProviderConfig {
    public constructor(public rootPath: string) {
    }
}
export class FileSystemProvider {
    constructor(public config: FileSystemProviderConfig = { rootPath: path.join(process.cwd(), 'storage') }) {}
    
    public async deleteFile(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(path.join(this.config.rootPath, filePath), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    public async deleteFolder(dirPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.rm(path.join(this.config.rootPath, dirPath), { recursive: true }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    public async getFile(filePath: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(this.config.rootPath, filePath), (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    public async getFileStream(filePath: string): Promise<Stream> {
        return new Promise((resolve, reject) => {
            var stream = fs.createReadStream(path.join(this.config.rootPath, filePath));
            stream.on('error', (err) => {
                reject(err);
            });
            resolve(stream);
        });
    }
    public async getFileStreamWithRange(filePath: string, start: number, end: number): Promise<Stream> {
        return new Promise((resolve, reject) => {
            var stream = fs.createReadStream(path.join(this.config.rootPath, filePath), {
                start: start,
                end: end
            });
            stream.on('error', (err) => {
                reject(err);
            });
            resolve(stream);
        });
    }
    public async getFileSize(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            fs.stat(path.join(this.config.rootPath, filePath), (err, stats) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(stats.size);
                }
            });
        });
    }
    public async getFileExists(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.stat(path.join(this.config.rootPath, filePath), (err, stats) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
    public async getFileList(dirPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(path.join(this.config.rootPath, dirPath), (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }
    public async getFileListRecursive(dirPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            var files: string[] = [];
            var walk = function (dir: string) {
                fs.readdirSync(dir).forEach(function (file) {
                    var newPath = path.join(dir, file);
                    if (fs.statSync(newPath).isDirectory()) {
                        walk(newPath);
                    } else {
                        files.push(newPath);
                    }
                });
            };
            walk(path.join(this.config.rootPath, dirPath));
            resolve(files);
        });
    }
    public async getFileListRecursiveWithFilter(dirPath: string, filter: (filePath: string) => boolean): Promise<string[]> {
        return new Promise((resolve, reject) => {
            var files: string[] = [];
            var walk = function (dir: string) {
                fs.readdirSync(dir).forEach(function (file) {
                    var newPath = path.join(dir, file);
                    if (fs.statSync(newPath).isDirectory()) {
                        walk(newPath);
                    } else {
                        if (filter(newPath)) {
                            files.push(newPath);
                        }
                    }
                });
            };
            walk(path.join(this.config.rootPath, dirPath));
            resolve(files);
        });
    }
    public async setFile(filePath: string, data: Buffer): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.config.rootPath)) {
                fs.mkdirSync(this.config.rootPath);
            }
            fs.writeFile(path.join(this.config.rootPath, filePath), data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    public async setFileStream(filePath: string, stream: Stream): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.config.rootPath)) {
                fs.mkdirSync(this.config.rootPath);
            }
            var writeStream = fs.createWriteStream(path.join(this.config.rootPath, filePath));
            stream.pipe(writeStream);
            writeStream.on('error', (err) => {
                reject(err);
            });
            writeStream.on('finish', () => {
                resolve();
            });
        });
    }
}