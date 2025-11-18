import fs from 'fs';
import { NextFSObject } from '../NextFSObject';
import { NextFSManager } from "../NextFSManager";
import { NextFSLocalDirectory } from "./NextFSLocalDirectory";
import { NextFSLocalFile } from "./NextFSLocalFile";
import { NextFSFile } from '../NextFSFile';
import { NextFSDirectory } from '../NextFSDirectory';


export class NextFSLocalManager extends NextFSManager {
    public async get(path: string): Promise<NextFSObject> {
        try {
            const stat = await fs.promises.stat(path);
            if (stat.isFile()) {
                return new NextFSLocalFile(path);
            }
        } catch (err) {
            // If file doesn't exist or error, return directory
        }
        return new NextFSLocalDirectory(path);
    }
    public async exists(path: string): Promise<boolean> {
        try {
            await fs.promises.access(path);
            return true;
        } catch {
            return false;
        }
    }
    public async createFile(path: string): Promise<NextFSObject> {
        return new NextFSLocalFile(path);
    }
    public async createDirectory(path: string): Promise<NextFSObject> {
        return new NextFSLocalDirectory(path);
    }
    public async delete(path: string): Promise<boolean> {
        try {
            await fs.promises.unlink(path);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public async move(path: string, newPath: string): Promise<boolean> {
        try {
            await fs.promises.rename(path, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public async copy(path: string, newPath: string): Promise<boolean> {
        try {
            await fs.promises.copyFile(path, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public async rename(path: string, newName: string): Promise<boolean> {
        try {
            var newPath = path.replace(/[^\/]*$/, newName);
            await fs.promises.rename(path, newPath);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    public static async upload(path: string, file: string | Buffer): Promise<boolean> {
        try {
            await fs.promises.writeFile(path, file);
            return true;
        }
        catch (err) {
            return false;
        }
    }
}
