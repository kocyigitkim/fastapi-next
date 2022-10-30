"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextRouteResponseStatus = exports.NextRouteResponse = void 0;
class NextRouteResponse {
    constructor(statusCode = NextRouteResponseStatus.NOT_FOUND, body = null, hasBody = false, headers = null) {
        this.statusCode = statusCode;
        this.body = body;
        this.hasBody = hasBody;
        this.headers = headers;
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
