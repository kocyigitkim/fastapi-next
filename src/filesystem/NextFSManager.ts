import { NextFSObject } from './NextFSObject';


export class NextFSManager {
    public static async get(path: string): Promise<NextFSObject> {
        return null;
    }
    public static async exists(path: string): Promise<boolean> {
        return false;
    }
    public static async createFile(path: string): Promise<NextFSObject> {
        return null;
    }
    public static async createDirectory(path: string): Promise<NextFSObject> {
        return null;
    }
    public static async delete(path: string): Promise<boolean> {
        return false;
    }
    public static async move(path: string, newPath: string): Promise<boolean> {
        return false;
    }
    public static async copy(path: string, newPath: string): Promise<boolean> {
        return false;
    }
    public static async rename(path: string, newName: string): Promise<boolean> {
        return false;
    }
}
