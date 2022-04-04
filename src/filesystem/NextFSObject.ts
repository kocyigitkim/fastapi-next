import stream from 'stream'
import { NextFSType } from './NextFSType';

export class NextFSObject {
    public name: string;
    public type: NextFSType;
    public parent: NextFSObject;
    public get fullPath() {
        return this.parent ? this.parent.fullPath + "/" + this.name : this.name;
    }
    public async getStream(): Promise<stream.Stream> {
        return null;
    }
    public async getSize(): Promise<number> {
        return 0;
    }
    public async exists(): Promise<boolean> {
        return false;
    }
}

