"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    constructor(success, message, data) {
        this.success = false;
        this.success = success;
        this.message = message || null;
        this.data = data || null;
    }
    setError(message) {
        this.message = message || "ERROR";
        this.success = false;
        return this;
    }
    setSuccess(data, message) {
        this.message = message || "SUCCESS";
        this.success = true;
        this.data = data;
        return this;
    }
}
exports.ApiResponse = ApiResponse;
