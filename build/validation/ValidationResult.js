"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ValidationResult = void 0;
class ValidationResult {
    constructor() {
        this.errors = [];
        this.success = true;
    }
    error(field, message) {
        this.errors.push({
            field: field,
            message: message
        });
        this.success = false;
    }
    addError(field, message) {
        this.errors.push({
            field: field,
            message: message
        });
        this.success = false;
    }
    async validateYup(schema, data) {
        var isError = false;
        var result = await schema.validate(data).catch(err => {
            isError = true;
            return err;
        });
        if (isError) {
            var err = result;
            this.error(err.path, err.message);
        }
    }
}
exports.ValidationResult = ValidationResult;
class ValidationError {
}
exports.ValidationError = ValidationError;
