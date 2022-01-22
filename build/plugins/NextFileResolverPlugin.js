"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextFileResolverPlugin = exports.NextFile = void 0;
const multer_1 = __importDefault(require("multer"));
const __1 = require("..");
class NextFile {
}
exports.NextFile = NextFile;
class NextFileResolverPlugin extends __1.NextPlugin {
    constructor(config = {}) {
        super("file-resolver");
        this.config = config;
    }
    async init(next) {
        next.log.info("File resolver plugin initialized");
        next.express.use((0, multer_1.default)(this.config).any());
        this.app = next;
    }
    async middleware(next) {
        if (!next.headers["content-type"] || next.headers["content-type"].indexOf("multipart/form-data") < 0) {
            return true;
        }
        if (Array.isArray(next.req.files)) {
            next.files = next.req.files;
            next.fileCount = next.req.files.length;
            for (var file of next.req.files) {
                if (!next.body[file.fieldname]) {
                    next.body[file.fieldname] = [file];
                }
                else {
                    next.body[file.fieldname].push(file);
                }
            }
        }
        else {
            next.fileCount = 0;
            for (var field in next.req.files) {
                var fieldValue = next.req.files[field];
                next.body[field] = fieldValue;
                next.fileCount += fieldValue.length;
            }
        }
        return true;
    }
}
exports.NextFileResolverPlugin = NextFileResolverPlugin;
