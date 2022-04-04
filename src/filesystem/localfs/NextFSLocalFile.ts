import stream from 'stream';
import fs from 'fs';
import { NextFSType } from "../NextFSType";
import { NextFSFile } from "../NextFSFile";
import { NextFSLocalDirectory } from "./NextFSLocalDirectory";


export class NextFSLocalFile extends NextFSFile {
    constructor(p: string) {
        super();
        if (p.includes("/")) {
            var parts = p.split("/");
            this.name = parts[parts.length - 1];
            this.parent = new NextFSLocalDirectory(parts.slice(0, parts.length - 1).join("/"));
        } else {
            this.name = p;
            this.parent = null;
        }
        this.type = NextFSType.File;
    }
    public type = NextFSType.File;
    public async getStream(): Promise<stream.Stream> {
        return fs.createReadStream(this.fullPath);
    }
    public async getSize(): Promise<number> {
        return fs.statSync(this.fullPath).size;
    }
    public async exists(): Promise<boolean> {
        return fs.existsSync(this.fullPath);
    }
}
