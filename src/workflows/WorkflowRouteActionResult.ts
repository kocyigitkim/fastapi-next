import { NextFlag } from "../NextFlag";

export class WorkflowRouteActionResult {
    public success: boolean;
    public data: any;
    public error?: string;
    public status?: number;
    public flag?: NextFlag;

    public setFlag(flag: NextFlag) {
        this.flag = flag;
        return this;
    }
    public setError(error: string, status: number) {
        this.success = false;
        this.error = error;
        this.status = status;
        return this;
    }
    public setSuccess(data: any) {
        this.success = true;
        this.data = data;
        this.error = undefined;
        this.status = 200;
        return this;
    }
}
