export declare class ValidationResult {
    errors: ValidationError[];
    success: boolean;
    error(field: string, message: string): void;
    addError(field: string, message: string): void;
}
export declare class ValidationError {
    field: string;
    message: string;
}
//# sourceMappingURL=ValidationResult.d.ts.map