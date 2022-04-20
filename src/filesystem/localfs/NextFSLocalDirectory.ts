import stream from 'stream';
import fs from 'fs';
import path from 'path';
import { NextFSType } from "../NextFSType";
import { NextFSDirectory } from "../NextFSDirectory";


export class NextFSLocalDirectory extends NextFSDirectory {
    constructor(p: string) {
        super();
        if (p.includes("/")) {
            this.parent = new NextFSLocalDirectory(path.dirname(p));
            this.name = path.basename(p);
        }
        else {
            this.parent = null;
            this.name = p;
        }
        this.type = NextFSType.Directory;
    }
    public type = NextFSType.Directory;
    public async getStream(): Promise<stream.Readable> {
        return null;
    }
    public async getSize(): Promise<number> {
        return null;
    }
    public async exists(): Promise<boolean> {
        return fs.existsSync(this.fullPath);
    }
}
