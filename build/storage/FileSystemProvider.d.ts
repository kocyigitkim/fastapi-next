/// <reference types="node" />
/// <reference types="node 2" />
import { Stream } from "stream";
/**
    * @deprecated
*/
export declare class FileSystemProviderConfig {
    rootPath: string;
    constructor(rootPath: string);
}
/**
 * @deprecated
 */
export declare class FileSystemProvider {
    config: FileSystemProviderConfig;
    constructor(config?: FileSystemProviderConfig);
    deleteFile(filePath: string): Promise<void>;
    deleteFolder(dirPath: string): Promise<void>;
    getFile(filePath: string): Promise<Buffer>;
    getFileStream(filePath: string): Promise<Stream>;
    getFileStreamWithRange(filePath: string, start: number, end: number): Promise<Stream>;
    getFileSize(filePath: string): Promise<number>;
    getFileExists(filePath: string): Promise<boolean>;
    getFileList(dirPath: string): Promise<string[]>;
    getFileListRecursive(dirPath: string): Promise<string[]>;
    getFileListRecursiveWithFilter(dirPath: string, filter: (filePath: string) => boolean): Promise<string[]>;
    setFile(filePath: string, data: Buffer): Promise<void>;
    setFileStream(filePath: string, stream: Stream): Promise<void>;
}
//# sourceMappingURL=FileSystemProvider.d.ts.map