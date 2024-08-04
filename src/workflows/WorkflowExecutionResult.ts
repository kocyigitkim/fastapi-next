import { WorkflowExecuteContext } from "./WorkflowExecuteContext";


export class WorkflowExecutionResult {
    public context: WorkflowExecuteContext;
    public result: any;
    public success: boolean;
    public error?: string[];
    public status?: number;
}
