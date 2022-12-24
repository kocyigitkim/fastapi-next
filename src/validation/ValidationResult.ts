import { AnySchema, ObjectSchema, StringSchema, ValidationError as YupValidationError } from "yup";

export class ValidationResult {
    public errors: ValidationError[] = [];
    public success: boolean = true;
    public error(field: string, message: string) {
        this.errors.push({
            field: field,
            message: message
        });
        this.success = false;
    }
    public addError(field: string, message: string) {
        this.errors.push({
            field: field,
            message: message
        });
        this.success = false;
    }
    public merge(a: ValidationResult): ValidationResult {
        this.errors = this.errors.concat(a.errors);
        this.success = this.success && a.success;
        return this;
    }
    public async validateYup(schema: AnySchema | StringSchema | ObjectSchema<any>, data: any) {
        var isError = false;
        var result = await schema.validate(data).catch(err => {
            isError = true;
            return err;
        })
        if (isError) {
            var err: YupValidationError = result as YupValidationError;
            this.error(err.path, err.message);
        }
    }
}
export class ValidationError {
    public field: string;
    public message: string;
}