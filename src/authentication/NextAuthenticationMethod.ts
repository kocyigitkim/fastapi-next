import EventEmitter from "events";
import { NextContextBase } from "../NextContext";
import { NextAuthenticationResult } from "./NextAuthenticationResult";
import { ObjectSchema } from "yup";
import { NextApplication } from "../NextApplication";

export class NextAuthenticationMethod {
    public static methodName?: string = "NextAuthenticationMethod";
    public basePath: string = "/auth";
    public loginPath?: string = "/login";
    public logoutPath?: string = "/logout";
    public infoPath?: string = "/me";
    public validatePath?: string = "/validate";
    public refreshPath?: string = "/refresh";
    public loginMethod: string = "POST";
    public logoutMethod: string = "POST";
    public infoMethod: string = "POST";
    public validateMethod: string = "POST";
    public refreshMethod: string = "POST";
    public loginSchema?: ObjectSchema<any>;
    public logoutSchema?: ObjectSchema<any>;
    public infoSchema?: ObjectSchema<any>;
    public validateSchema?: ObjectSchema<any>;
    public refreshSchema?: ObjectSchema<any>;

    public async init(app: NextApplication){
        return;
    }

    public async refresh(context: NextContextBase) {
        var r = new NextAuthenticationResult();
        
        // Check if refresh token is provided
        const refreshToken = (context.body as any).refreshToken || 
                             context.req.headers['x-refresh-token'] || 
                             context.req.query.refreshToken;
        
        if (!refreshToken) {
            r.success = false;
            r.error = "Refresh token is required";
            return r;
        }
        
        // Default implementation does not validate refresh tokens
        r.success = false;
        r.error = "Not implemented";
        return r;
    }
    public async login(context: NextContextBase) {
        var r = new NextAuthenticationResult();
        r.success = false;
        r.error = "Not implemented";
        return r;
    }
    public async logout(context: NextContextBase) {
        var r = new NextAuthenticationResult();
        r.success = false;
        r.error = "Not implemented";
        return r;
    }
    public async info(context: NextContextBase) {
        var r = new NextAuthenticationResult();
        r.success = false;
        r.error = "Not implemented";
        return r;
    }
    public async validate(context: NextContextBase) {
        var r = new NextAuthenticationResult();
        r.success = false;
        r.error = "Not implemented";
        return r;
    }
    protected generateSecureCode(length: number = 6): string {
        var code = "";
        for (var i = 0; i < length; i++) {
            code += Math.floor(Math.random() * 10);
        }
        return code;
    }
}
