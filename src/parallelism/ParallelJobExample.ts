import { ParallelJob } from './ParallelJob';

// Example usage of ParallelJob with sequential processing support

interface TaskData {
    id: string;
    type: 'file-upload' | 'database-write' | 'api-call' | 'email-send';
    payload: any;
}

// Create a new parallel job instance
const job = new ParallelJob<TaskData>();

// Configure which types should be processed sequentially
job.setSequentialTypes(
    (item) => item.type, // Type identifier function
    ['database-write', 'file-upload'] // Types that need sequential processing
);

// Set parallel size for non-sequential items
job.parallelSize = 8;

// Define the action to perform on each item
job.action = async (item: TaskData, index: number, arr: TaskData[]) => {
    console.log(`Processing ${item.type} task: ${item.id}`);
    
    switch (item.type) {
        case 'file-upload':
            // Simulate file upload (needs sequential processing)
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(`File uploaded: ${item.id}`);
            break;
            
        case 'database-write':
            // Simulate database write (needs sequential processing)
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`Database record written: ${item.id}`);
            break;
            
        case 'api-call':
            // Simulate API call (can be parallel)
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`API call completed: ${item.id}`);
            break;
            
        case 'email-send':
            // Simulate email sending (can be parallel)
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log(`Email sent: ${item.id}`);
            break;
            
        default:
            throw new Error(`Unknown task type: ${item.type}`);
    }
    
    return true;
};

// Set up event listeners
job.on('start', () => {
    console.log('Job processing started');
});

job.on('queued', (item: TaskData, mode: string) => {
    console.log(`Task queued for ${mode} processing: ${item.id} (${item.type})`);
});

job.on('progress', (item: TaskData) => {
    console.log(`Processing started: ${item.id} (${item.type})`);
});

job.on('success', (item: TaskData, elapsedMs: number) => {
    console.log(`Task completed successfully: ${item.id} in ${elapsedMs}ms`);
});

job.on('error', (item: TaskData, elapsedMs: number, error?: Error) => {
    console.error(`Task failed: ${item.id} after ${elapsedMs}ms`, error);
});

job.on('stopped', () => {
    console.log('Job processing stopped');
});

// Example usage function
export async function exampleUsage() {
    // Start the job processor
    await job.start();
    
    // Enqueue various types of tasks
    const tasks: TaskData[] = [
        { id: 'task-1', type: 'api-call', payload: { url: 'https://api.example.com/data' } },
        { id: 'task-2', type: 'database-write', payload: { table: 'users', data: { name: 'John' } } },
        { id: 'task-3', type: 'email-send', payload: { to: 'user@example.com' } },
        { id: 'task-4', type: 'file-upload', payload: { file: 'document.pdf' } },
        { id: 'task-5', type: 'api-call', payload: { url: 'https://api.example.com/update' } },
        { id: 'task-6', type: 'database-write', payload: { table: 'logs', data: { event: 'login' } } },
        { id: 'task-7', type: 'email-send', payload: { to: 'admin@example.com' } },
        { id: 'task-8', type: 'file-upload', payload: { file: 'image.jpg' } }
    ];
    
    // Enqueue all tasks
    for (const task of tasks) {
        await job.enqueue(task);
    }
    
    // Monitor queue status
    setInterval(() => {
        const status = job.getQueueStatus();
        console.log('Queue Status:', status);
        
        // Stop if all queues are empty and nothing is processing
        if (status.parallelQueue === 0 && 
            status.sequentialQueue === 0 && 
            status.parallelActive === 0 && 
            status.sequentialActive === 0) {
            job.stop();
        }
    }, 1000);
}

// Export the configured job for use in other modules
export { job };