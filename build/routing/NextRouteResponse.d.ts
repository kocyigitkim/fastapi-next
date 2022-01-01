export declare class NextRouteResponse {
    statusCode: NextRouteResponseStatus;
    body: any;
    hasBody: Boolean;
    headers: {
        [key: string]: string;
    };
    constructor(statusCode?: NextRouteResponseStatus, body?: any, hasBody?: Boolean, headers?: {
        [key: string]: string;
    });
}
export declare enum NextRouteResponseStatus {
    OK = 200,
    NOT_FOUND = 404,
    BAD_REQUEST = 400,
    INTERNAL_SERVER_ERROR = 500
}
//# sourceMappingURL=NextRouteResponse.d.ts.map