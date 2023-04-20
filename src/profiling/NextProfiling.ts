import EventEmitter from "events";
import os from 'os'
import pidusage from 'pidusage'

export class NextMetric {
    public name: string;
    public value: any;
    public unit: string;
    public description: string;
    public tags: string[];
    public timestamp: Date;
}

export interface INextProfilerComponent {
    init(profiling: NextProfiling): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    retrieve(): Promise<NextMetric>;
}

export class NextProcessProfiler implements INextProfilerComponent {
    async init(profiling: NextProfiling) {
    }
    async start(): Promise<void> {
    }
    async stop(): Promise<void> {
    }
    async retrieve(): Promise<NextMetric> {
        var metric = new NextMetric();
        metric.name = "Process Usage";
        await new Promise((resolve) => {
            pidusage(process.pid, (err, stats) => {
                metric.value = stats;
                resolve(null);
            })
        });
        metric.unit = "ms";
        metric.description = "Process Usage";
        metric.tags = ["Process"];
        metric.timestamp = new Date();
        return metric;
    }

}

export class NextMetricSnapshot {
    public metrics: NextMetric[];
    public timestamp: Date;
}

export class NextProfiling {
    private emitter: EventEmitter = new EventEmitter({});
    private metrics: NextMetricSnapshot[];
    private isRun: boolean = false;
    private isStopped: boolean = false;
    private components: INextProfilerComponent[] = [];
    public on(name: string, action: any) {
        this.emitter.on(name, action);
    }
    public off(name: string, action: any) {
        this.emitter.off(name, action);
    }
    public once(name: string, action: any) {
        this.emitter.once(name, action);
    }
    public addComponent(component: INextProfilerComponent) {
        this.components.push(component);
    }
    public async start() {
        this.metrics = [];
        this.run();
    }

    public async stop() {
        this.isRun = false;
        while (!this.isStopped) {
            await new Promise((resolve) => {
                setTimeout(resolve, 10);
            });
        }
        this.isStopped = false;
    }
    public async reset() {
        this.metrics = [];
    }

    private async run() {
        this.isRun = true;
        while (this.isRun) {
            var snapshot = new NextMetricSnapshot();
            snapshot.metrics = [];
            snapshot.timestamp = new Date();
            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                var metric = await component.retrieve();
                snapshot.metrics.push(metric);
            }
            this.metrics.push(snapshot);
            this.emitter.emit("metric", snapshot);
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
        }
        this.isStopped = true;
    }

    public async retrieveMetrics() {
        return this.metrics;
    }
}