import { CorsOptions } from "cors";
import { NextAuthentication } from "../authentication/NextAuthentication";
import { NextAuthorizationBase } from "../authorization/NextAuthorizationBase";
import { NextSocketOptions } from "../sockets/NextSocketOptions";
import { Algorithm as JWTAlgorithm, VerifyOptions as JWTVerifyOptions, SignOptions as JWTSignOptions, JwtPayload } from 'jsonwebtoken';
import { NextApplication } from "../NextApplication";
export declare class NextOptions {
    debug: boolean;
    port: number;
    routerDirs: string[];
    cors?: CorsOptions;
    authorization?: NextAuthorizationBase;
    authentication?: NextAuthentication;
    sockets?: NextSocketOptions;
    socketRouterDirs?: string[];
    healthCheck?: NextHealthCheckOptions;
    bodyParser?: NextBodyParserOptions;
    staticDir?: string;
    routeNotFoundContent?: string;
    enableServices?: boolean;
    rendering?: NextRenderingOptions;
    security: NextSecurityOptions;
}
export declare class NextSecurityOptions {
    jwt?: NextJwtOptions;
}
export declare class NextJwtOptions {
    algorithm?: JWTAlgorithm;
    secret?: string;
    checkIfGranted?: (req: Request) => Promise<boolean>;
    verifyOptions?: JWTVerifyOptions;
    verifyPayload?: (payload: any) => Promise<any>;
    signOptions?: JWTSignOptions;
    createPayload?: (req: Request, app: NextApplication, additional: any) => Promise<any>;
    messages?: {
        unauthorized: string;
        invalidToken: string;
    };
    refreshWhen?: (payload: JwtPayload) => Promise<boolean>;
    resolveSessionId?: (payload: JwtPayload) => Promise<string>;
    refreshTokenWhenExpired?: boolean;
    anonymousPaths?: (string | RegExp)[];
}
export declare class NextRenderingOptions {
    viewDir?: string;
    enabled?: boolean;
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