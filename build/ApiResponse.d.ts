export declare class ApiResponse<T> {
    success: boolean;
    message: string | null;
    data: T | null;
    constructor(success?: boolean, message?: string, data?: T);
    setError(message?: string): this;
    setSuccess(data?: T, message?: string): this;
}
//# sourceMappingURL=ApiResponse.d.ts.map