import { ParallelJob, JobTypeConfig } from "./ParallelJob";

export interface SchedulerOptions<T> {
    parallelSize?: number;
    typeConfig?: JobTypeConfig<T>;
    onProgress?: (item: T) => void;
    onSuccess?: (item: T, elapsedMs: number) => void;
    onError?: (item: T, elapsedMs: number, error?: Error) => void;
}

export class ParallelJobScheduler {
    public static async schedule<T>(
        batch: T[], 
        action: (item: T, index: number, arr: T[]) => Promise<Boolean>, 
        options: SchedulerOptions<T> = {}
    ): Promise<ParallelJob<T>> {
        const {
            parallelSize = 16,
            typeConfig,
            onProgress,
            onSuccess,
            onError
        } = options;

        const job = new ParallelJob<T>();
        job.action = action;
        job.parallelSize = parallelSize;

        // Configure sequential types if provided
        if (typeConfig) {
            job.setSequentialTypes(
                typeConfig.typeIdentifier,
                Array.from(typeConfig.sequentialTypes)
            );
        }

        // Set up event listeners
        if (onProgress) {
            job.on('progress', onProgress);
        }
        if (onSuccess) {
            job.on('success', onSuccess);
        }
        if (onError) {
            job.on('error', onError);
        }

        // Enqueue all items
        for (const item of batch) {
            await job.enqueue(item);
        }

        await job.start();
        return job;
    }

    public static async scheduleWithSequential<T>(
        batch: T[],
        action: (item: T, index: number, arr: T[]) => Promise<Boolean>,
        typeIdentifier: (item: T) => string,
        sequentialTypes: string[],
        parallelSize: number = 16
    ): Promise<ParallelJob<T>> {
        return this.schedule(batch, action, {
            parallelSize,
            typeConfig: {
                typeIdentifier,
                sequentialTypes: new Set(sequentialTypes)
            }
        });
    }
}