"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    constructor(success, message, data) {
        this.success = false;
        this.$statusCode = 200;
        this.success = success;
        this.message = message || null;
        this.data = data || null;
    }
    setError(message, statusCode) {
        this.message = message || "ERROR";
        this.success = false;
        this.$statusCode = statusCode || 500;
        return this;
    }
    setSuccess(data, message) {
        this.message = message || "SUCCESS";
        this.success = true;
        this.data = data;
        this.$statusCode = 200;
        return this;
    }
    status(statusCode) {
        this.$statusCode = statusCode;
        return this;
    }
}
exports.ApiResponse = ApiResponse;
