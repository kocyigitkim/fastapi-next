import { NextFSObject } from './NextFSObject';


export class NextFSManager {
    public async get(path: string): Promise<NextFSObject> {
        return null;
    }
    public async exists(path: string): Promise<boolean> {
        return false;
    }
    public async createFile(path: string): Promise<NextFSObject> {
        return null;
    }
    public async createDirectory(path: string): Promise<NextFSObject> {
        return null;
    }
    public async delete(path: string): Promise<boolean> {
        return false;
    }
    public async move(path: string, newPath: string): Promise<boolean> {
        return false;
    }
    public async copy(path: string, newPath: string): Promise<boolean> {
        return false;
    }
    public async rename(path: string, newName: string): Promise<boolean> {
        return false;
    }
}
