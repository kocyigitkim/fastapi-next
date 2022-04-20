import { NextFSObject } from './NextFSObject';
import { NextFSType } from "./NextFSType";


export class NextFSFile extends NextFSObject {
    public type = NextFSType.File;
    public async writeBuffer(buffer: Buffer): Promise<void> {
        return null;
    }
    public async appendBuffer(buffer: Buffer): Promise<void> {
        return null;
    }
    public async readBuffer(size: number = -1): Promise<Buffer> {
        return null;
    }
    public async delete(): Promise<boolean> {
        return null;
    }
    public async move(newPath: string): Promise<boolean> {
        return null;
    }
}
