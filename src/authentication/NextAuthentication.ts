import { NextUser } from "../structure/NextUser";
import { NextRole } from "../structure/NextRole";
import { NextApplication } from "../NextApplication";
import { ApiResponse } from "../ApiResponse";
import { NextAuthenticationMethod } from "./NextAuthenticationMethod";
import { NextAuthenticationResult } from "./NextAuthenticationResult";
import { NextAuthenticationPlugin } from "./plugins/NextAuthenticationPlugin";

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
        (result as any).message = result.error;
        delete result.error;
        return result;
    }

    if (method.loginPath) {
        app.routeBuilder.register(method.loginPath, "post", async (ctx) => {
            var result = await method.login(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                if (ctx.session) {
                    (ctx.session as any).nextAuthentication = result;
                }
                response = cleanResult(result) as any;
            }
            else {
                response.setError("authentication failed. may be the method is not implemented");
            }
            return response;
        });
    }
    if (method.logoutPath) {
        app.routeBuilder.register(method.logoutPath, "post", async (ctx) => {
            var result = await method.logout(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                if (ctx.session) {
                    (ctx.session as any).nextAuthentication = null;
                }
                response = cleanResult(result) as any;
            }
            else {
                response.setError("logout failed. may be the method is not implemented");
            }
            return response;
        });
    }
    if (method.infoPath) {
        app.routeBuilder.register(method.infoPath, "post", async (ctx) => {
            var result = await method.info(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                response = cleanResult(result) as any;
            }
            else {
                response.setError("info failed. may be the method is not implemented");
            }
            return response;
        });
    }
    if (method.validatePath) {
        app.routeBuilder.register(method.validatePath, "post", async (ctx) => {
            var result = await method.validate(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                response = cleanResult(result) as any;
            }
            else {
                response.setError("validation failed. may be the method is not implemented");
            }
            return response;
        });
    }
}
