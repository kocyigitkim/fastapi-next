import { NextPlugin } from './NextPlugin';
import { FileSystemProvider, FileSystemProviderConfig } from '../storage/FileSystemProvider';
import { NextApplication, NextContextBase } from '..';
import { NextHealthCheckStatus } from '../config/NextOptions';

export class NextFileSystemPlugin extends NextPlugin<any>{
    private provider: FileSystemProvider;
    constructor(public config: FileSystemProviderConfig = undefined) {
        super('fs');
        this.provider = new FileSystemProvider(config);
    }
    public async init(app: NextApplication): Promise<void>{
        app.log.info("File System Plugin Loaded");
    }
    public async retrieve(next: NextContextBase): Promise<any> {
        return this.provider;
    }
    public async healthCheck(next: NextApplication): Promise<NextHealthCheckStatus> {
        return NextHealthCheckStatus.Alive();
    }
}