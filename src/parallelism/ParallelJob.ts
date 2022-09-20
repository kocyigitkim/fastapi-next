import { EventEmitter } from "stream";
import { ParallelJobState } from "./ParallelJobState";
import { ParallelJobEventNames } from "./ParallelJobEventNames";


export class ParallelJob<T> extends EventEmitter {
    private batch: T[] = [];
    private stack: T[] = [];
    private state: ParallelJobState = ParallelJobState.NotStarted;
    public parallelSize: number = 16;
    public action: (item: T, index: number, arr: T[]) => Promise<Boolean>;
    constructor() {
        super();
        this.execute = this.execute.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.enqueue = this.enqueue.bind(this);
    }
    public on(eventName: ParallelJobEventNames, listener: (...args: any[]) => void): this {
        super.on(eventName, listener);
        return this;
    }
    public emit(eventName: ParallelJobEventNames, ...args: any[]) {
        return super.emit(eventName, ...args);
    }
    public async start() {
        if (this.state != ParallelJobState.Started) {
            this.state = ParallelJobState.Started;
            this.execute();
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
    private async execute() {
        while (true) {
            if (this.state == ParallelJobState.Stop) {
                break;
            }

            for (let i = 0; i < Math.min(this.parallelSize - this.stack.length, this.parallelSize); i++) {

                (async () => {
                    // Push item to stack
                    var item = this.batch.shift();
                    if (!item) return;

                    this.stack.push(item);
                    this.emit('progress', item);
                    var startDate = new Date();
                    // Process item
                    var hasError = null;
                    var error = null;
                    var result = await this.action(item, this.stack.length - 1, this.stack).catch(err => {
                        hasError = true;
                        error = err;
                    });

                    var endDate = new Date();
                    var elapsedMs = (endDate.valueOf() - startDate.valueOf());
                    var isSuccess = Boolean(result);
                    if (hasError || !isSuccess) {
                        this.emit('error', item, elapsedMs);
                    }
                    else {
                        this.emit('success', item, elapsedMs);
                    }

                    // Remove from stack
                    this.stack.splice(this.stack.indexOf(item), 1);
                })();

            }

            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    }
    public async enqueue(item: T) {
        this.batch.push(item);
        this.emit('queued', item);
    }
}
