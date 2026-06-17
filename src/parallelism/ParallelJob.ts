import { EventEmitter } from "stream";
import { ParallelJobState } from "./ParallelJobState";
import { ParallelJobEventNames } from "./ParallelJobEventNames";


export interface JobTypeConfig<T> {
    typeIdentifier: (item: T) => string;
    sequentialTypes: Set<string>;
}

export class ParallelJob<T> extends EventEmitter {
    private parallelBatch: T[] = [];
    private sequentialBatch: T[] = [];
    private parallelStack: T[] = [];
    private sequentialQueue: T[] = [];
    private state: ParallelJobState = ParallelJobState.NotStarted;
    private isSequentialProcessing: boolean = false;
    
    public parallelSize: number = 16;
    public action: (item: T, index: number, arr: T[]) => Promise<Boolean>;
    public typeConfig?: JobTypeConfig<T>;
    constructor() {
        super();
        this.execute = this.execute.bind(this);
        this.executeSequential = this.executeSequential.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.enqueue = this.enqueue.bind(this);
        this.enqueueSequential = this.enqueueSequential.bind(this);
        this.enqueueParallel = this.enqueueParallel.bind(this);
        this.setSequentialTypes = this.setSequentialTypes.bind(this);
        this.isSequentialType = this.isSequentialType.bind(this);
    }
    public on(eventName: ParallelJobEventNames, listener: (...args: any[]) => void): this {
        super.on(eventName, listener);
        return this;
    }
    public emit(eventName: ParallelJobEventNames, ...args: any[]) {
        return super.emit(eventName, ...args);
    }
    
    public setSequentialTypes(typeIdentifier: (item: T) => string, sequentialTypes: string[]) {
        this.typeConfig = {
            typeIdentifier,
            sequentialTypes: new Set(sequentialTypes)
        };
    }
    
    private isSequentialType(item: T): boolean {
        if (!this.typeConfig) return false;
        const type = this.typeConfig.typeIdentifier(item);
        return this.typeConfig.sequentialTypes.has(type);
    }
    public async start() {
        if (this.state != ParallelJobState.Started) {
            this.state = ParallelJobState.Started;
            this.execute();
            this.executeSequential();
            this.emit('start');
        }
    }
    public async stop() {
        this.state = ParallelJobState.Stop;
        this.emit('stop');
        while (this.state == ParallelJobState.Stop) {
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
        if (this.state == ParallelJobState.Stopped) {
            this.emit('stopped');
        }
    }
    public async kill() {
        this.stop();
        this.parallelStack = [];
        this.parallelBatch = [];
        this.sequentialQueue = [];
        this.sequentialBatch = [];
    }
    private async execute() {
        while (true) {
            if (this.state == ParallelJobState.Stop) {
                break;
            }

            for (let i = 0; i < Math.min(this.parallelSize - this.parallelStack.length, this.parallelSize); i++) {
                if (this.parallelBatch.length === 0) break;

                (async () => {
                    // Push item to stack
                    var item = this.parallelBatch.shift();
                    if (!item) return;

                    this.parallelStack.push(item);
                    this.emit('progress', item);
                    var startDate = new Date();
                    // Process item
                    var hasError = null;
                    var error = null;
                    var result = await this.action(item, this.parallelStack.length - 1, this.parallelStack).catch(err => {
                        hasError = true;
                        error = err;
                    });

                    var endDate = new Date();
                    var elapsedMs = (endDate.valueOf() - startDate.valueOf());
                    var isSuccess = Boolean(result);
                    if (hasError || !isSuccess) {
                        this.emit('error', item, elapsedMs, error);
                    }
                    else {
                        this.emit('success', item, elapsedMs);
                    }

                    // Remove from stack
                    this.parallelStack.splice(this.parallelStack.indexOf(item), 1);
                })();
            }

            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    }
    
    private async executeSequential() {
        while (true) {
            if (this.state == ParallelJobState.Stop) {
                break;
            }
            
            if (this.isSequentialProcessing || this.sequentialBatch.length === 0) {
                await new Promise((resolve) => setTimeout(resolve, 10));
                continue;
            }
            
            this.isSequentialProcessing = true;
            
            // Process one item at a time for sequential processing
            const item = this.sequentialBatch.shift();
            if (!item) {
                this.isSequentialProcessing = false;
                continue;
            }
            
            this.sequentialQueue.push(item);
            this.emit('progress', item);
            
            const startDate = new Date();
            let hasError = null;
            let error = null;
            
            try {
                const result = await this.action(item, 0, [item]);
                const endDate = new Date();
                const elapsedMs = (endDate.valueOf() - startDate.valueOf());
                const isSuccess = Boolean(result);
                
                if (!isSuccess) {
                    this.emit('error', item, elapsedMs);
                } else {
                    this.emit('success', item, elapsedMs);
                }
            } catch (err) {
                hasError = true;
                error = err;
                const endDate = new Date();
                const elapsedMs = (endDate.valueOf() - startDate.valueOf());
                this.emit('error', item, elapsedMs, error);
            }
            
            // Remove from sequential queue
            this.sequentialQueue.splice(this.sequentialQueue.indexOf(item), 1);
            this.isSequentialProcessing = false;
            
            // Small delay between sequential items
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    }
    public async enqueue(item: T) {
        if (this.isSequentialType(item)) {
            this.sequentialBatch.push(item);
            this.emit('queued', item, 'sequential');
        } else {
            this.parallelBatch.push(item);
            this.emit('queued', item, 'parallel');
        }
    }
    
    public async enqueueSequential(item: T) {
        this.sequentialBatch.push(item);
        this.emit('queued', item, 'sequential');
    }
    
    public async enqueueParallel(item: T) {
        this.parallelBatch.push(item);
        this.emit('queued', item, 'parallel');
    }
    
    public getQueueStatus() {
        return {
            parallelQueue: this.parallelBatch.length,
            sequentialQueue: this.sequentialBatch.length,
            parallelActive: this.parallelStack.length,
            sequentialActive: this.sequentialQueue.length,
            isSequentialProcessing: this.isSequentialProcessing
        };
    }
}
