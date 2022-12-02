import { ParallelJob } from "./ParallelJob";

export class ParallelJobScheduler {
    public static async schedule<T>(batch: T[], action: (item: T, index: number, arr: T[]) => Promise<Boolean>, parallelSize: number = 16): Promise<ParallelJob<T>> {
        var job = new ParallelJob<T>();
        job.action = action;
        job.parallelSize = parallelSize;
        for (let i = 0; i < batch.length; i++) {
            job.enqueue(batch[i]);
        }
        await job.start();
        return job;
    }
}