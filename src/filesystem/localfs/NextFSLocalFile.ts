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
    public async writeBuffer(buffer: Buffer): Promise<void> {
        fs.writeFileSync(this.fullPath, buffer);
    }
    public async appendBuffer(buffer: Buffer): Promise<void> {
        fs.appendFileSync(this.fullPath, buffer);
    }
    public async readBuffer(size: number = -1): Promise<Buffer> {
        return fs.readFileSync(this.fullPath);
    }
    public async delete(): Promise<boolean> {
        try {
            fs.unlinkSync(this.fullPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public async move(newPath: string): Promise<boolean> {
        try {
            fs.renameSync(this.fullPath, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
}
