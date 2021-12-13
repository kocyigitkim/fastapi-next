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
    constructor() {
        super("file-resolver");
        this.client = (0, multer_1.default)();
    }
    async init(next) {
        next.log.info("File resolver plugin initialized");
    }
    async middleware(next) {
        this.client.any()(next.req, next.res, () => { });
        next.files = next.req.files || [];
        next.fileCount = next.files.length;
        return true;
    }
}
exports.NextFileResolverPlugin = NextFileResolverPlugin;
