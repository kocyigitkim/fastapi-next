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
    }
}
exports.ValidationResult = ValidationResult;
class ValidationError {
}
exports.ValidationError = ValidationError;
