import { CorsOptions } from "cors";
import { NextAuthentication } from "../authentication/NextAuthentication";
import { NextAuthorizationBase } from "../authorization/NextAuthorizationBase";
import { NextSocketOptions } from "../sockets/NextSocketOptions";
import jwt, { Algorithm as JWTAlgorithm, VerifyOptions as JWTVerifyOptions, SignOptions as JWTSignOptions, JwtPayload } from 'jsonwebtoken';
import { NextApplication } from "../NextApplication";
import { NextAuthenticationMethod } from "..";


export class NextOptions {
    public baseUrl?: string;
    public debug: boolean = false;
    public port: number;
    public routerDirs: string[] = [];
    public cors?: CorsOptions = null;
    public disableCorsMiddleware: boolean = false;
    public authorization?: NextAuthorizationBase = null;
    public authentication?: NextAuthentication = null;
    public sockets?: NextSocketOptions = null;
    public socketRouterDirs?: string[] = [];
    public healthCheck?: NextHealthCheckOptions;
    public bodyParser?: NextBodyParserOptions;
    public staticDir?: string;
    public routeNotFoundContent?: string;
    public enableServices?: boolean = false;
    public rendering?: NextRenderingOptions;
    public security: NextSecurityOptions = new NextSecurityOptions();
    public switchLoggerAsConsole?: boolean = false;
    public enableCookiesForSession?: boolean = false;
    public openApi?: NextOpenApiOptions = new NextOpenApiOptions();
    public swagger?: NextSwaggerOptions = new NextSwaggerOptions();
    public enableRealtimeConfig?: boolean = false;
    public workingDataFormat?: NextWorkingDataFormat = NextWorkingDataFormat.JSON;
    public addAuthMethod(method: NextAuthenticationMethod) {
        if (!this.authentication) this.authentication = new (require('../authentication/NextAuthentication').NextAuthentication)();
        this.authentication.add(method);
    }
}

export class NextSecurityOptions {
    public jwt?: NextJwtOptions;
}

export class NextJwtOptions {
    public algorithm?: JWTAlgorithm = "HS256";
    public secret?: string = "secret";
    public checkIfGranted?: (req: Request) => Promise<boolean> = () => new Promise(resolve => resolve(true));
    public verifyOptions?: JWTVerifyOptions = null;
    public verifyPayload?: (payload: any) => Promise<any> = (payload) => new Promise(resolve => resolve(payload));
    public signOptions?: JWTSignOptions = null;
    public createPayload?: (req: Request, app: NextApplication, additional: any) => Promise<any> = (req, app) => new Promise(resolve => resolve({}));

    public messages? = {
        unauthorized: "Unauthorized",
        invalidToken: "Invalid token"
    }
    public refreshWhen?: (payload: JwtPayload) => Promise<boolean> = (payload) => new Promise(resolve => {
        var isTokenExpired = payload.exp && payload.exp < new Date().getTime();
        resolve(isTokenExpired);
    });
    public resolveSessionId?: (payload: JwtPayload) => Promise<string> = (payload: any) => new Promise(resolve => resolve(payload.sessionId));
    public refreshTokenWhenExpired?: boolean = true;
    public anonymousPaths?: (string | RegExp)[] = [];
}

export class NextRenderingOptions {
    public viewDir?: string;
    public enabled?: boolean = false;
}

export class NextBodyParserOptions {
    public json?: {
        limit: string;
        strict: boolean;
    };
    public urlencoded?: {
        extended: boolean;
        limit: string;
    };
    public raw?: {
        limit: string;
    };
}

export class NextHealthCheckOptions {
    public livenessPath: string = "/health/check";
    public readinessPath: string = "/health/ready";
}

export class NextHealthCheckStatus {
    constructor(public success: boolean, public message?: string) { }
    public static Dead() {
        return new NextHealthCheckStatus(false, "Dead");
    }
    public static Alive() {
        return new NextHealthCheckStatus(true, "Alive");
    }
}

export class NextOpenApiOptions {
    public path: string = "/openapi.json";
    public enabled?: boolean = true;
    public title: string = "Fast Api";
    public version: string = "1.0.0";
    public description: string = "Fast Api - OpenApi Gateway";
    public https: boolean = false;
    public http: boolean = true;
    public termsOfService?: string;
    public contactName?: string;
    public contactUrl?: string;
    public contactEmail?: string;
    public licenseName?: string;
    public licenseUrl?: string;
}
export class NextSwaggerOptions {
    public path: string = "/swagger";
    public enabled?: boolean = true;
    public customScript?: string = null;
    public customCss?: string = null;
    public customFavicon?: string = null;
    public customSiteTitle?: string = null;
    public customHeadContent?: string = null;
}

export enum NextWorkingDataFormat {
    JSON = "json",
    YAML = "yaml"
}