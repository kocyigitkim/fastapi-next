export class ApiResponse<T = any> {
    success: boolean = false;
    message: string | null;
    data: T | null;
    constructor(success?: boolean, message?: string, data?: T) {
        this.success = success;
        this.message = message || null;
        this.data = data || null;
    }
    setError(message?: string) {
        this.message = message || "ERROR";
        this.success = false;
        return this;
    }
    setSuccess(data?: T, message?: string) {
        this.message = message || "SUCCESS";
        this.success = true;
        this.data = data;
        return this;
    }
}
