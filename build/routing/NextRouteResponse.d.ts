export declare class NextRouteResponse {
    statusCode: NextRouteResponseStatus;
    body: any;
    hasBody: Boolean;
    constructor(statusCode?: NextRouteResponseStatus, body?: any, hasBody?: Boolean);
}
export declare enum NextRouteResponseStatus {
    OK = 0,
    NOT_FOUND = 1,
    BAD_REQUEST = 2,
    INTERNAL_SERVER_ERROR = 3
}
//# sourceMappingURL=NextRouteResponse.d.ts.map