import { CorsOptions } from "cors";
import { NextAuthorizationBase } from "../authorization/NextAuthorizationBase";
import { NextSocketOptions } from "../sockets/NextSocketOptions";
export declare class NextOptions {
    debug: boolean;
    port: number;
    routerDirs: string[];
    cors?: CorsOptions;
    authorization?: NextAuthorizationBase;
    sockets?: NextSocketOptions;
    socketRouterDirs?: string[];
    healthCheck?: NextHealthCheckOptions;
    bodyParser?: NextBodyParserOptions;
}
export declare class NextBodyParserOptions {
    json?: {
        limit: string;
        strict: boolean;
    };
    urlencoded?: {
        extended: boolean;
        limit: string;
    };
    raw?: {
        limit: string;
    };
}
export declare class NextHealthCheckOptions {
    livenessPath: string;
    readinessPath: string;
}
export declare class NextHealthCheckStatus {
    success: boolean;
    message?: string;
    constructor(success: boolean, message?: string);
    static Dead(): NextHealthCheckStatus;
    static Alive(): NextHealthCheckStatus;
}
//# sourceMappingURL=NextOptions.d.ts.map