import { NextContextBase } from "../NextContext";
import { NextHttpBufferStreamOptions, NextHttpFileStream, NextHttpFileStreamOptions } from "../streaming/NextHttpFileStream";
import YAML, { CreateNodeOptions, DocumentOptions, ParseOptions, SchemaOptions, ToStringOptions } from 'yaml'

export class NextRouteResponse {
    constructor(
        public statusCode: NextRouteResponseStatus = NextRouteResponseStatus.NOT_FOUND,
        public body: any = null,
        public hasBody: Boolean = false,
        public headers: { [key: string]: string } = null
    ) { }
    public static Xml(data: any, status?: number) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, data, true, {
            "Content-Type": "text/xml",
            "Cache-Control": "no-cache"
        });
    }
    public static Html(data: any, status?: number) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, data, true, {
            "Content-Type": "text/html",
            "Cache-Control": "no-cache"
        });
    }
    public static Text(data: any, status?: number) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, data, true, {
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache"
        });
    }
    public static Yaml(data: any, status?: number, options?: DocumentOptions & SchemaOptions & ParseOptions & CreateNodeOptions & ToStringOptions) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, YAML.stringify(data, options), true, {
            "Content-Type": "text/yaml",
            "Cache-Control": "no-cache"
        });
    }
    public static Json(data: any, status?: number) {
        return new NextRouteResponse(status || NextRouteResponseStatus.OK, JSON.stringify(data), true, {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        });
    }
    public static File(context: NextContextBase, options: NextHttpFileStreamOptions) {
        return NextHttpFileStream.streamFile(context, options);
    }
    public static Buffer(context: NextContextBase, options: NextHttpBufferStreamOptions) {
        return NextHttpFileStream.streamBuffer(context, options);
    }
    public static FileNotFound() {
        return new NextRouteResponse(NextRouteResponseStatus.NOT_FOUND, "File not found", true);
    }
    public static NotFound() {
        return new NextRouteResponse(NextRouteResponseStatus.NOT_FOUND, "Not found", true);
    }
    public static BadRequest() {
        return new NextRouteResponse(NextRouteResponseStatus.BAD_REQUEST, "Bad request", true);
    }
    public static InternalServerError() {
        return new NextRouteResponse(NextRouteResponseStatus.INTERNAL_SERVER_ERROR, "Internal server error", true);
    }
    public static NotImplemented() {
        return new NextRouteResponse(NextRouteResponseStatus.NOT_IMPLEMENTED, "Not implemented", true);
    }
    public static ServiceUnavailable() {
        return new NextRouteResponse(NextRouteResponseStatus.SERVICE_UNAVAILABLE, "Service unavailable", true);
    }
    public static UnprocessableEntity() {
        return new NextRouteResponse(NextRouteResponseStatus.UNPROCESSABLE_ENTITY, "Unprocessable entity", true);
    }
    public static UnsupportedMediaType() {
        return new NextRouteResponse(NextRouteResponseStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type", true);
    }
    public static Unauthorized() {
        return new NextRouteResponse(NextRouteResponseStatus.UNAUTHORIZED, "Unauthorized", true);
    }
    public static Redirect(url: string) {
        return new NextRouteResponse(NextRouteResponseStatus.REDIRECT, url, true);
    }
    public static Ok(body: any = null, headers: { [key: string]: string } = null) {
        return new NextRouteResponse(NextRouteResponseStatus.OK, body, true, headers);
    }
    public static Created(body: any = null, headers: { [key: string]: string } = null) {
        return new NextRouteResponse(NextRouteResponseStatus.CREATED, body, true, headers);
    }
    public static NoContent(headers: { [key: string]: string } = null) {
        return new NextRouteResponse(NextRouteResponseStatus.NO_CONTENT, null, false, headers);
    }
    public static Unknown() {
        return new NextRouteResponse(NextRouteResponseStatus.UNKNOWN, "Unknown error", true);
    }
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