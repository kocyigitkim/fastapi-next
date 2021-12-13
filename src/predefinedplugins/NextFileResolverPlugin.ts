import multer, { Multer } from "multer";
import { NextApplication, NextContext, NextPlugin } from "..";

export class NextFile {
    public path: string;
    public name: string;
    public size: number;
    public type: string;
    public content: string;
}

export class NextFileResolverPlugin extends NextPlugin {
    private client: Multer
    constructor() {
        super("file-resolver");
        this.client = multer();
    }
    public async init(next: NextApplication): Promise<void> {
        next.log.info("File resolver plugin initialized");
    }
    public async middleware(next: NextContext): Promise<boolean> {
        this.client.any()(next.req, next.res, () => { });
        (next as any).files = next.req.files || [];
        (next as any).fileCount = (next as any).files.length;
        return true;
    }
}