import fs from 'fs';
import { NextFSObject } from '../NextFSObject';
import { NextFSManager } from "../NextFSManager";
import { NextFSLocalDirectory } from "./NextFSLocalDirectory";
import { NextFSLocalFile } from "./NextFSLocalFile";


export class NextFSLocalManager extends NextFSManager {
    public async get(path: string): Promise<NextFSObject> {
        var isFile = false;
        if (fs.existsSync(path)) {
            isFile = fs.statSync(path).isFile();
        }
        if (isFile) {
            return new NextFSLocalFile(path);
        }
        return new NextFSLocalDirectory(path);
    }
    public async exists(path: string): Promise<boolean> {
        return fs.existsSync(path);
    }
    public async createFile(path: string): Promise<NextFSObject> {
        return new NextFSLocalFile(path);
    }
    public async createDirectory(path: string): Promise<NextFSObject> {
        return new NextFSLocalDirectory(path);
    }
    public async delete(path: string): Promise<boolean> {
        try {
            fs.unlinkSync(path);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public async move(path: string, newPath: string): Promise<boolean> {
        try {
            fs.renameSync(path, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public async copy(path: string, newPath: string): Promise<boolean> {
        try {
            fs.copyFileSync(path, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public async rename(path: string, newName: string): Promise<boolean> {
        try {
            var newPath = path.replace(/[^\/]*$/, newName);
            fs.renameSync(path, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }

}
