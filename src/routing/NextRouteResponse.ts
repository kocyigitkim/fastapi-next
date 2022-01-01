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
    NOT_FOUND = 404,
    BAD_REQUEST = 400,
    INTERNAL_SERVER_ERROR = 500
}