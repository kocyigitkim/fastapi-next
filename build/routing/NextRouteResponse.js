"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextRouteResponseStatus = exports.NextRouteResponse = void 0;
class NextRouteResponse {
    constructor(statusCode = NextRouteResponseStatus.NOT_FOUND, body = null, hasBody = false) {
        this.statusCode = statusCode;
        this.body = body;
        this.hasBody = hasBody;
    }
}
exports.NextRouteResponse = NextRouteResponse;
var NextRouteResponseStatus;
(function (NextRouteResponseStatus) {
    NextRouteResponseStatus[NextRouteResponseStatus["OK"] = 0] = "OK";
    NextRouteResponseStatus[NextRouteResponseStatus["NOT_FOUND"] = 1] = "NOT_FOUND";
    NextRouteResponseStatus[NextRouteResponseStatus["BAD_REQUEST"] = 2] = "BAD_REQUEST";
    NextRouteResponseStatus[NextRouteResponseStatus["INTERNAL_SERVER_ERROR"] = 3] = "INTERNAL_SERVER_ERROR";
})(NextRouteResponseStatus = exports.NextRouteResponseStatus || (exports.NextRouteResponseStatus = {}));
