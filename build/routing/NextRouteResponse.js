"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextRouteResponseStatus = exports.NextRouteResponse = void 0;
const NextHttpFileStream_1 = require("../streaming/NextHttpFileStream");
const yaml_1 = __importDefault(require("yaml"));
class NextRouteResponse {
    constructor(statusCode = NextRouteResponseStatus.NOT_FOUND, body = null, hasBody = false, headers = null) {
        this.statusCode = statusCode;
        this.body = body;
        this.hasBody = hasBody;
        this.headers = headers;
    }
    static Xml(data, status) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, data, true, {
            "Content-Type": "text/xml",
            "Cache-Control": "no-cache"
        });
    }
    static Html(data, status) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, data, true, {
            "Content-Type": "text/html",
            "Cache-Control": "no-cache"
        });
    }
    static Text(data, status) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, data, true, {
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache"
        });
    }
    static Yaml(data, status, options) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, yaml_1.default.stringify(data, options), true, {
            "Content-Type": "text/yaml",
            "Cache-Control": "no-cache"
        });
    }
    static Json(data, status) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, JSON.stringify(data), true, {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        });
    }
    static File(context, options) {
        return NextHttpFileStream_1.NextHttpFileStream.streamFile(context, options);
    }
    static Buffer(context, options) {
        return NextHttpFileStream_1.NextHttpFileStream.streamBuffer(context, options);
    }
    static FileNotFound() {
        return new NextRouteResponse(NextRouteResponseStatus.NOT_FOUND, "File not found", true);
    }
    static NotFound() {
        return new NextRouteResponse(NextRouteResponseStatus.NOT_FOUND, "Not found", true);
    }
    static BadRequest() {
        return new NextRouteResponse(NextRouteResponseStatus.BAD_REQUEST, "Bad request", true);
    }
    static InternalServerError() {
        return new NextRouteResponse(NextRouteResponseStatus.INTERNAL_SERVER_ERROR, "Internal server error", true);
    }
    static NotImplemented() {
        return new NextRouteResponse(NextRouteResponseStatus.NOT_IMPLEMENTED, "Not implemented", true);
    }
    static ServiceUnavailable() {
        return new NextRouteResponse(NextRouteResponseStatus.SERVICE_UNAVAILABLE, "Service unavailable", true);
    }
    static UnprocessableEntity() {
        return new NextRouteResponse(NextRouteResponseStatus.UNPROCESSABLE_ENTITY, "Unprocessable entity", true);
    }
    static UnsupportedMediaType() {
        return new NextRouteResponse(NextRouteResponseStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type", true);
    }
    static Unauthorized() {
        return new NextRouteResponse(NextRouteResponseStatus.UNAUTHORIZED, "Unauthorized", true);
    }
    static Redirect(url) {
        return new NextRouteResponse(NextRouteResponseStatus.REDIRECT, url, true);
    }
    static Ok(body = null, headers = null) {
        return new NextRouteResponse(NextRouteResponseStatus.OK, body, true, headers);
    }
    static Created(body = null, headers = null) {
        return new NextRouteResponse(NextRouteResponseStatus.CREATED, body, true, headers);
    }
    static NoContent(headers = null) {
        return new NextRouteResponse(NextRouteResponseStatus.NO_CONTENT, null, false, headers);
    }
    static Unknown() {
        return new NextRouteResponse(NextRouteResponseStatus.UNKNOWN, "Unknown error", true);
    }
}
exports.NextRouteResponse = NextRouteResponse;
var NextRouteResponseStatus;
(function (NextRouteResponseStatus) {
    NextRouteResponseStatus[NextRouteResponseStatus["OK"] = 200] = "OK";
    NextRouteResponseStatus[NextRouteResponseStatus["CREATED"] = 201] = "CREATED";
    NextRouteResponseStatus[NextRouteResponseStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    NextRouteResponseStatus[NextRouteResponseStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    NextRouteResponseStatus[NextRouteResponseStatus["ACCESS_DENIED"] = 403] = "ACCESS_DENIED";
    NextRouteResponseStatus[NextRouteResponseStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    NextRouteResponseStatus[NextRouteResponseStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    NextRouteResponseStatus[NextRouteResponseStatus["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    NextRouteResponseStatus[NextRouteResponseStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    NextRouteResponseStatus[NextRouteResponseStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    NextRouteResponseStatus[NextRouteResponseStatus["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
    NextRouteResponseStatus[NextRouteResponseStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    NextRouteResponseStatus[NextRouteResponseStatus["UNKNOWN"] = 0] = "UNKNOWN";
    NextRouteResponseStatus[NextRouteResponseStatus["REDIRECT"] = 302] = "REDIRECT";
})(NextRouteResponseStatus = exports.NextRouteResponseStatus || (exports.NextRouteResponseStatus = {}));
