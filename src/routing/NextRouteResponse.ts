export class NextRouteResponse {
    constructor(
        public statusCode: NextRouteResponseStatus = NextRouteResponseStatus.NOT_FOUND,
        public body: any = null,
        public hasBody: Boolean = false,
        public headers: { [key: string]: string } = null
    ) { }
}

export enum NextRouteResponseStatus {
    OK,
    NOT_FOUND,
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR
}