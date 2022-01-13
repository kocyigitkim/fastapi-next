import { CorsOptions } from "cors";
import { NextAuthorizationBase } from "../authorization/NextAuthorizationBase";
export declare class NextOptions {
    debug: boolean;
    port: number;
    routerDirs: string[];
    cors: CorsOptions;
    authorization?: NextAuthorizationBase;
}
//# sourceMappingURL=NextOptions.d.ts.map