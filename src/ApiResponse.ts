export class ApiResponse<T = any> {
    success: boolean = false;
    message: string | null;
    data: T | null;
    $statusCode: number = 200;
    constructor(success?: boolean, message?: string, data?: T) {
        this.success = success;
        this.message = message || null;
        this.data = data || null;
    }
    setError(message?: string, statusCode?: number) {
        this.message = message || "ERROR";
        this.success = false;
        this.$statusCode = statusCode || 500;
        return this;
    }
    setSuccess(data?: T, message?: string) {
        this.message = message || "SUCCESS";
        this.success = true;
        this.data = data;
        this.$statusCode = 200;
        return this;
    }
    status(statusCode: number) {
        this.$statusCode = statusCode;
        return this;
    }
}
