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
    CREATED = 201,
    NO_CONTENT = 204,
    NOT_FOUND = 404,
    ACCESS_DENIED = 403,
    BAD_REQUEST = 400,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    SERVICE_UNAVAILABLE = 503,
    UNPROCESSABLE_ENTITY = 422,
    UNSUPPORTED_MEDIA_TYPE = 415,
    UNAUTHORIZED = 401,
    UNKNOWN = 0,
    REDIRECT = 302
}
//# sourceMappingURL=NextRouteResponse.d.ts.map