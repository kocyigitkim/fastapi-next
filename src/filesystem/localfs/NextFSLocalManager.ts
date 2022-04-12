import fs from 'fs';
import { NextFSObject } from '../NextFSObject';
import { NextFSManager } from "../NextFSManager";
import { NextFSLocalDirectory } from "./NextFSLocalDirectory";
import { NextFSLocalFile } from "./NextFSLocalFile";
import { NextFSFile } from '../NextFSFile';
import { NextFSDirectory } from '../NextFSDirectory';


export class NextFSLocalManager extends NextFSManager {
    public static async get(path: string): Promise<NextFSObject> {
        var isFile = false;
        if (fs.existsSync(path)) {
            isFile = fs.statSync(path).isFile();
        }
        if (isFile) {
            return new NextFSLocalFile(path);
        }
        return new NextFSLocalDirectory(path);
    }
    public static async exists(path: string): Promise<boolean> {
        return fs.existsSync(path);
    }
    public static async createFile(path: string): Promise<NextFSFile> {
        return new NextFSLocalFile(path);
    }
    public static async createDirectory(path: string): Promise<NextFSDirectory> {
        return new NextFSLocalDirectory(path);
    }
    public static async delete(path: string): Promise<boolean> {
        try {
            fs.unlinkSync(path);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public static async move(path: string, newPath: string): Promise<boolean> {
        try {
            fs.renameSync(path, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public static async copy(path: string, newPath: string): Promise<boolean> {
        try {
            fs.copyFileSync(path, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public static async rename(path: string, newName: string): Promise<boolean> {
        try {
            var newPath = path.replace(/[^\/]*$/, newName);
            fs.renameSync(path, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public static async upload(path: string, file: string | Buffer): Promise<boolean> {
        try {
            fs.writeFileSync(path, file);
            return true;
        }
        catch (err) {
            return false;
        }
    }
}
