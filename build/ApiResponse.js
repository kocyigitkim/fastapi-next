"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    constructor(success, message, data) {
        this.success = false;
        this.success = success;
        this.message = message;
        this.data = data;
    }
    setError(message) {
        this.message = message;
        this.success = false;
        return this;
    }
    setSuccess(data) {
        this.success = true;
        this.data = data;
        return this;
    }
}
exports.ApiResponse = ApiResponse;
