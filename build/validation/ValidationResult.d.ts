import { AnySchema, ObjectSchema, StringSchema } from "yup";
export declare class ValidationResult {
    errors: ValidationError[];
    success: boolean;
    error(field: string, message: string): void;
    addError(field: string, message: string): void;
    validateYup(schema: AnySchema | StringSchema | ObjectSchema<any>, data: any): Promise<void>;
}
export declare class ValidationError {
    field: string;
    message: string;
}
//# sourceMappingURL=ValidationResult.d.ts.map