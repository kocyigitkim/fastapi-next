export class NextRouteResponse {
    constructor(
        public statusCode: NextRouteResponseStatus = NextRouteResponseStatus.NOT_FOUND,
        public body: any = null,
        public hasBody: Boolean = false,
        public headers: { [key: string]: string } = null
    ) { }
}

export enum NextRouteResponseStatus {
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