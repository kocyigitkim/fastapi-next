export declare class ApiResponse<T> {
    success?: boolean;
    message?: string;
    data?: T;
    constructor(success?: boolean, message?: string, data?: T);
    setError(message: string): this;
    setSuccess(data: T): this;
}
//# sourceMappingURL=ApiResponse.d.ts.map