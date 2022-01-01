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
    NextRouteResponseStatus[NextRouteResponseStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    NextRouteResponseStatus[NextRouteResponseStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    NextRouteResponseStatus[NextRouteResponseStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(NextRouteResponseStatus = exports.NextRouteResponseStatus || (exports.NextRouteResponseStatus = {}));
