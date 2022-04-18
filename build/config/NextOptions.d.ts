import { CorsOptions } from "cors";
import { NextAuthorizationBase } from "../authorization/NextAuthorizationBase";
import { NextSocketOptions } from "../sockets/NextSocketOptions";
export declare class NextOptions {
    debug: boolean;
    port: number;
    routerDirs: string[];
    cors: CorsOptions;
    authorization?: NextAuthorizationBase;
    sockets?: NextSocketOptions;
    socketRouterDirs?: string[];
}
//# sourceMappingURL=NextOptions.d.ts.map