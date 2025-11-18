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
        const stat = await fs.promises.stat(this.fullPath);
        return stat.size;
    }
    public async exists(): Promise<boolean> {
        try {
            await fs.promises.access(this.fullPath);
            return true;
        } catch {
            return false;
        }
    }
    public async writeBuffer(buffer: Buffer): Promise<void> {
        await fs.promises.writeFile(this.fullPath, buffer);
    }
    public async appendBuffer(buffer: Buffer): Promise<void> {
        await fs.promises.appendFile(this.fullPath, buffer);
    }
    public async readBuffer(size: number = -1): Promise<Buffer> {
        return await fs.promises.readFile(this.fullPath);
    }
    public async delete(): Promise<boolean> {
        try {
            await fs.promises.unlink(this.fullPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public async move(newPath: string): Promise<boolean> {
        try {
            await fs.promises.rename(this.fullPath, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
}
