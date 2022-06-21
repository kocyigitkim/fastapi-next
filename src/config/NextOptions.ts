import { CorsOptions } from "cors";
import { NextAuthorizationBase } from "../authorization/NextAuthorizationBase";
import { NextSocketOptions } from "../sockets/NextSocketOptions";


export class NextOptions {
    public debug: boolean = false;
    public port: number = 5000;
    public routerDirs: string[] = [];
    public cors?: CorsOptions = null;
    public authorization?: NextAuthorizationBase = null;
    public sockets?: NextSocketOptions = null;
    public socketRouterDirs?: string[] = [];
    public healthCheck?: NextHealthCheckOptions;
    public bodyParser?: NextBodyParserOptions;
}

export class NextBodyParserOptions{
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