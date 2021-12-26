import formidable from "formidable";
import multer, { Multer, Options as MulterOptions } from "multer";
import { NextApplication, NextContextBase, NextPlugin } from "..";

export class NextFile {
    public path: string;
    public name: string;
    public size: number;
    public type: string;
    public content: string;
}

export class NextFileResolverPlugin extends NextPlugin<any> {
    private app: NextApplication;
    constructor(public config: MulterOptions = {}) {
        super("file-resolver");
    }
    public async init(next: NextApplication): Promise<void> {
        next.log.info("File resolver plugin initialized");
        next.express.use(multer(this.config).any());
        this.app = next;
    }
    public async middleware(next: NextContextBase): Promise<boolean> {
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