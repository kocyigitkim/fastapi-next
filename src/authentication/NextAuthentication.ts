import { NextUser } from "../structure/NextUser";
import { NextRole } from "../structure/NextRole";
import { NextApplication } from "../NextApplication";
import { ApiResponse } from "../ApiResponse";
import { NextAuthenticationMethod } from "./NextAuthenticationMethod";
import { NextAuthenticationResult } from "./NextAuthenticationResult";
import { NextAuthenticationPlugin } from "./plugins/NextAuthenticationPlugin";
import { NextAuthenticationMethodRegistry } from "./methods/NextAuthenticationMethodRegistry";
import { NextBasicAuthenticationMethod } from "./methods/NextBasicAuthenticationMethod";
import { NextTwoFactorAuthenticationMethod } from "./methods/NextTwoFactorAuthenticationMethod";
import { NextRouteResponse } from "../routing/NextRouteResponse";
import { NextFlag } from "../NextFlag";
import EventEmitter from "events";

NextAuthenticationMethodRegistry.register(NextBasicAuthenticationMethod);
NextAuthenticationMethodRegistry.register(NextTwoFactorAuthenticationMethod);

type AuthenticationEventNames = 'authenticated' | 'authentication-failure' | 'loggedout' | 'loggedout-failure' | 'validated' | 'validation-failure';

export class NextAuthentication extends EventEmitter {
    public retrieveUser: (id: string) => Promise<NextUser>;
    private methods: NextAuthenticationMethod[] = [];
    constructor() {
        super();
    }
    public get Methods() {
        return this.methods;
    }
    public on(eventName: AuthenticationEventNames, callback: Function) {
        return super.on(eventName, callback as any);
    }

    public emit(eventName: AuthenticationEventNames, ...args: any[]) {
        return super.emit(eventName, ...args);
    }

    public add(method: NextAuthenticationMethod) {
        this.methods.push(method);
    }
    public addMany(methods: NextAuthenticationMethod[]) {
        for (var method of methods) {
            this.add(method);
        }
    }
    public register(app: NextApplication) {
        var auth = new NextAuthenticationPlugin("auth", true);
        app.registry.register(auth);
        for (var method of this.methods) {
            registerAuthenticationMethodToApplication(this, method, app);
        }
    }

}

function registerAuthenticationMethodToApplication(_this: NextAuthentication, method: NextAuthenticationMethod, app: NextApplication) {
    console.log("Registering authentication method " + (method.constructor as any)?.methodName);

    // Init authentication method
    if (method.init) method.init(app).catch(console.error);

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
        let loginDef: any = async (ctx) => {
            var result = await method.login(ctx).catch(console.error);
            var response = new ApiResponse();

            if (result) {
                if (result.success) {
                    _this.emit('authenticated', ctx, result);
                }
                else {
                    _this.emit("authentication-failure", ctx, result);
                }
                if (result.prevent) {
                    return NextFlag.Exit;
                }
                if (ctx.session) {
                    (ctx.session as any).nextAuthentication = result;
                }
                response = cleanResult(result) as any;
                if (!response.data) response.data = {};

                var additionalParameters = {};

                if (app.jwtController && response.success) {
                    const jwtToken = await app.jwtController.CreateToken(ctx.req);
                    additionalParameters["accessToken"] = jwtToken;
                    
                    // Generate refresh token if JWT controller is available
                    if (app.options.security?.jwt?.refreshTokenWhenExpired) {
                        // Create a session ID for the refresh token
                        const sessionId = ctx.session?.id || 
                                         crypto.randomUUID();
                                          
                        const refreshToken = await app.jwtController.CreateRefreshToken(ctx.req, sessionId);
                        additionalParameters["refreshToken"] = refreshToken;
                        
                        // Store the session ID in the authentication result for future verification
                        if (result) {
                            if (!result.additionalInfo) {
                                result.additionalInfo = {};
                            }
                            result.additionalInfo.refreshSessionId = sessionId;
                        }
                    }
                }

                for (var parameterName in additionalParameters) {
                    response.data[parameterName] = additionalParameters[parameterName];
                }
            }
            else {
                response.setError("authentication failed. may be the method is not implemented");
            }
            return response;
        };
        loginDef.validate = method.loginSchema;
        app.routeBuilder.register(method.basePath + method.loginPath, method.loginMethod?.toLowerCase(), loginDef);
    }
    if (method.logoutPath) {
        let logoutDef: any = async (ctx) => {
            var result = await method.logout(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                if (result.success) {
                    _this.emit("loggedout", ctx, result);
                }
                else {
                    _this.emit('loggedout-failure', ctx, result);
                }
                if (result.prevent) {
                    return NextFlag.Exit;
                }
                if (ctx.session) {
                    (ctx.session as any).nextAuthentication = null;
                }
                response = cleanResult(result) as any;
            }
            else {
                response.setError("logout failed. may be the method is not implemented");
            }
            return response;
        };
        logoutDef.validate = method.logoutSchema;
        app.routeBuilder.register(method.basePath + method.logoutPath, method.logoutMethod?.toLowerCase(), logoutDef);
    }
    if (method.infoPath) {
        let infoDef: any = async (ctx) => {
            var result = await method.info(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                if (result.prevent) {
                    return NextFlag.Exit;
                }
                response = cleanResult(result) as any;
            }
            else {
                response.setError("info failed. may be the method is not implemented");
            }
            return response;
        };
        infoDef.validate = method.infoSchema;
        app.routeBuilder.register(method.basePath + method.infoPath, method.infoMethod?.toLowerCase(), infoDef);
    }
    if (method.validatePath) {
        let validateDef: any = async (ctx) => {
            var result = await method.validate(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                if (result.success) {
                    _this.emit("validated", ctx, result);
                }
                else {
                    _this.emit('validation-failure', ctx, result);
                }
                if (result.prevent) {
                    return NextFlag.Exit;
                }
                response = cleanResult(result) as any;
            }
            else {
                response.setError("validation failed. may be the method is not implemented");
            }
            return response;
        };
        validateDef.validate = method.validateSchema;
        app.routeBuilder.register(method.basePath + method.validatePath, method.validateMethod?.toLowerCase(), validateDef);
    }
    if (method.refreshPath) {
        let refreshDef: any = async (ctx) => {
            var result = await method.refresh(ctx).catch(console.error);
            var response = new ApiResponse();
            if (result) {
                // Check if the refresh token is valid
                if (result.success) {
                    // Generate new access token
                    if (app.jwtController) {
                        const jwtToken = await app.jwtController.CreateToken(ctx.req);
                        if (!response.data) response.data = {};
                        response.data["accessToken"] = jwtToken;
                    }
                }
                response = cleanResult(result) as any;
            }
            else {
                response.setError("refresh failed. may be the method is not implemented");
            }
            return response;
        };
        refreshDef.validate = method.refreshSchema;
        app.routeBuilder.register(method.basePath + method.refreshPath, method.refreshMethod?.toLowerCase(), refreshDef);
    }
}
