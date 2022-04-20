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
    }
}
export class ValidationError {
    public field: string;
    public message: string;
}