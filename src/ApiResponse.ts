export class ApiResponse<T> {
    success?: boolean = false;
    message?: string;
    data?: T;
    constructor(success?: boolean, message?: string, data?: T) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    setError(message: string) {
        this.message = message;
        this.success = false;
        return this;
    }
    setSuccess(data: T) {
        this.success = true;
        this.data = data;
        return this;
    }
}
