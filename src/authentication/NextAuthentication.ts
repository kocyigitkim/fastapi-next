import { NextUser } from "../structure/NextUser";
import { NextRole } from "../structure/NextRole";
import { NextApplication } from "../NextApplication";
import { ApiResponse } from "../ApiResponse";
import { NextAuthenticationMethod } from "./NextAuthenticationMethod";
import { NextAuthenticationResult } from "./NextAuthenticationResult";
import { NextPlugin } from "../plugins/NextPlugin";
import { NextContextBase } from "../NextContext";
import { NextFlag } from "../NextFlag";
import { NextHealthCheckStatus } from "../config/NextOptions";

export class NextAuthentication {
    public retrieveUser: (id: string) => Promise<NextUser>;
    private methods: NextAuthenticationMethod[] = [];
    public get Methods() {
        return this.methods;
    }

    public add(method: NextAuthenticationMethod) {
        this.methods.push(method);
    }

    public register(app: NextApplication) {
        var auth = new NextAuthenticationPlugin("auth", true);
        app.registry.register(auth);
        for (var method of this.methods) {
            registerAuthenticationMethodToApplication(method, app);
        }
    }

}

export class NextAuthenticationPlugin extends NextPlugin<any>{
    public name: string = "NextAuthenticationPlugin";
    public async retrieve(ctx: NextContextBase): Promise<any> {
        var authenticationResult: NextAuthenticationResult = null;
        if (ctx.session) {
            authenticationResult = (ctx.session as any).nextAuthentication;
        }
        return authenticationResult;
    }
    
    public async middleware(ctx: NextContextBase): Promise<boolean | NextFlag> {
        var isGranted = false;
        var authenticationResult: NextAuthenticationResult = null;
        if (ctx.session) {
            authenticationResult = (ctx.session as any).nextAuthentication;
        }
        if (authenticationResult.validationCode) {
            if (authenticationResult.additionalInfo) {
                if (Boolean(authenticationResult.additionalInfo["validationCode"])) {
                    isGranted = true;
                }
            }
        }
        else {
            if (authenticationResult.user) {
                isGranted = true;
            }
        }
        return isGranted ? NextFlag.Continue : NextFlag.Exit;
    }

    public healthCheck(next: NextApplication): Promise<NextHealthCheckStatus> {
        return Promise.resolve(NextHealthCheckStatus.Alive());
    }
}

function registerAuthenticationMethodToApplication(method: NextAuthenticationMethod, app: NextApplication) {

    const cleanResult = (result: NextAuthenticationResult) => {
        if (result.validationCode) {
            delete result.validationCode;
        }
        if (result.additionalInfo) {
            delete result.additionalInfo;
        }
        if (result.user) {
            if (result.user.additionalInfo) {
                delete result.user.additionalInfo;
            }
        }
        return result;
    }

    if (method.loginPath) {
        app.routeBuilder.register(method.loginPath, "POST", async (ctx) => {
            var result = await method.login(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                if (ctx.session) {
                    (ctx.session as any).nextAuthentication = result;
                }
                response.data = cleanResult(result);
                response.success = true;
                response.message = "authentication successful";
            }
            else {
                response.setError("authentication failed. may be the method is not implemented");
            }
            return response;
        });
    }
    if (method.logout) {
        app.routeBuilder.register(method.logoutPath, "POST", async (ctx) => {
            var result = await method.logout(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                if (ctx.session) {
                    (ctx.session as any).nextAuthentication = null;
                }
                response.data = cleanResult(result);
                response.success = true;
                response.message = "logout successful";
            }
            else {
                response.setError("logout failed. may be the method is not implemented");
            }
            return response;
        });
    }
    if (method.info) {
        app.routeBuilder.register(method.infoPath, "GET", async (ctx) => {
            var result = await method.info(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                response.data = cleanResult(result);
                response.success = true;
                response.message = "info successful";
            }
            else {
                response.setError("info failed. may be the method is not implemented");
            }
            return response;
        });
    }
    if (method.validate) {
        app.routeBuilder.register(method.validatePath, "POST", async (ctx) => {
            var result = await method.validate(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                response.data = cleanResult(result);
                response.success = true;
                response.message = "validation successful";
            }
            else {
                response.setError("validation failed. may be the method is not implemented");
            }
            return response;
        });
    }
}
