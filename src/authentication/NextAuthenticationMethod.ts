import { NextContextBase } from "../NextContext";
import { NextAuthenticationResult } from "./NextAuthenticationResult";


export class NextAuthenticationMethod {
    public static methodName?: string = "NextAuthenticationMethod";
    public basePath: string = "/auth";
    public loginPath?: string = "/login";
    public logoutPath?: string = "/logout";
    public infoPath?: string = "/me";
    public validatePath?: string = "/validate";
    public refreshPath?: string;
    public loginMethod: string = "POST";
    public logoutMethod: string = "POST";
    public infoMethod: string = "POST";
    public validateMethod: string = "POST";
    public refreshMethod: string = "POST";
    public async refresh(context: NextContextBase) {
        var r = new NextAuthenticationResult();
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
