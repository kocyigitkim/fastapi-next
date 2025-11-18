import path from "path";
import { Stream } from "stream";
import fs from "fs";

/**
    * @deprecated
*/
export class FileSystemProviderConfig {
    public constructor(public rootPath: string) {
    }
}
/**
 * @deprecated
 */
export class FileSystemProvider {
    constructor(public config: FileSystemProviderConfig = { rootPath: path.join(process.cwd(), 'storage') }) { }

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
        const files: string[] = [];
        const walk = async (dir: string) => {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await walk(fullPath);
                } else {
                    files.push(fullPath);
                }
            }
        };
        await walk(path.join(this.config.rootPath, dirPath));
        return files;
    }
    public async getFileListRecursiveWithFilter(dirPath: string, filter: (filePath: string) => boolean): Promise<string[]> {
        const files: string[] = [];
        const walk = async (dir: string) => {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await walk(fullPath);
                } else {
                    if (filter(fullPath)) {
                        files.push(fullPath);
                    }
                }
            }
        };
        await walk(path.join(this.config.rootPath, dirPath));
        return files;
    }
    public async setFile(filePath: string, data: Buffer): Promise<void> {
        try {
            await fs.promises.access(this.config.rootPath);
        } catch {
            await fs.promises.mkdir(this.config.rootPath, { recursive: true });
        }
        await fs.promises.writeFile(path.join(this.config.rootPath, filePath), data);
    }
    public async setFileStream(filePath: string, stream: Stream): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await fs.promises.access(this.config.rootPath);
            } catch {
                await fs.promises.mkdir(this.config.rootPath, { recursive: true });
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