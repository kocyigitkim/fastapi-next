"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemProvider = exports.FileSystemProviderConfig = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class FileSystemProviderConfig {
    constructor(rootPath) {
        this.rootPath = rootPath;
    }
}
exports.FileSystemProviderConfig = FileSystemProviderConfig;
class FileSystemProvider {
    constructor(config = { rootPath: path_1.default.join(process.cwd(), 'storage') }) {
        this.config = config;
    }
    async getFile(filePath) {
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(path_1.default.join(this.config.rootPath, filePath), (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    async getFileStream(filePath) {
        return new Promise((resolve, reject) => {
            var stream = fs_1.default.createReadStream(path_1.default.join(this.config.rootPath, filePath));
            stream.on('error', (err) => {
                reject(err);
            });
            resolve(stream);
        });
    }
    async getFileStreamWithRange(filePath, start, end) {
        return new Promise((resolve, reject) => {
            var stream = fs_1.default.createReadStream(path_1.default.join(this.config.rootPath, filePath), {
                start: start,
                end: end
            });
            stream.on('error', (err) => {
                reject(err);
            });
            resolve(stream);
        });
    }
    async getFileSize(filePath) {
        return new Promise((resolve, reject) => {
            fs_1.default.stat(path_1.default.join(this.config.rootPath, filePath), (err, stats) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(stats.size);
                }
            });
        });
    }
    async getFileExists(filePath) {
        return new Promise((resolve, reject) => {
            fs_1.default.stat(path_1.default.join(this.config.rootPath, filePath), (err, stats) => {
                if (err) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    async getFileList(dirPath) {
        return new Promise((resolve, reject) => {
            fs_1.default.readdir(path_1.default.join(this.config.rootPath, dirPath), (err, files) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(files);
                }
            });
        });
    }
    async getFileListRecursive(dirPath) {
        return new Promise((resolve, reject) => {
            var files = [];
            var walk = function (dir) {
                fs_1.default.readdirSync(dir).forEach(function (file) {
                    var newPath = path_1.default.join(dir, file);
                    if (fs_1.default.statSync(newPath).isDirectory()) {
                        walk(newPath);
                    }
                    else {
                        files.push(newPath);
                    }
                });
            };
            walk(path_1.default.join(this.config.rootPath, dirPath));
            resolve(files);
        });
    }
    async getFileListRecursiveWithFilter(dirPath, filter) {
        return new Promise((resolve, reject) => {
            var files = [];
            var walk = function (dir) {
                fs_1.default.readdirSync(dir).forEach(function (file) {
                    var newPath = path_1.default.join(dir, file);
                    if (fs_1.default.statSync(newPath).isDirectory()) {
                        walk(newPath);
                    }
                    else {
                        if (filter(newPath)) {
                            files.push(newPath);
                        }
                    }
                });
            };
            walk(path_1.default.join(this.config.rootPath, dirPath));
            resolve(files);
        });
    }
    async setFile(filePath, data) {
        return new Promise((resolve, reject) => {
            if (!fs_1.default.existsSync(this.config.rootPath)) {
                fs_1.default.mkdirSync(this.config.rootPath);
            }
            fs_1.default.writeFile(path_1.default.join(this.config.rootPath, filePath), data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async setFileStream(filePath, stream) {
        return new Promise((resolve, reject) => {
            if (!fs_1.default.existsSync(this.config.rootPath)) {
                fs_1.default.mkdirSync(this.config.rootPath);
            }
            var writeStream = fs_1.default.createWriteStream(path_1.default.join(this.config.rootPath, filePath));
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
exports.FileSystemProvider = FileSystemProvider;
