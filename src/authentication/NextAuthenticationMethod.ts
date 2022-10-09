import { NextContextBase } from "../NextContext";
import { NextAuthenticationResult } from "./NextAuthenticationResult";


export class NextAuthenticationMethod {
    public name?: string = "NextAuthenticationMethod";
    public loginPath?: string = "/auth/login";
    public logoutPath?: string = "/auth/logout";
    public infoPath?: string = "/auth/me";
    public validatePath?: string = "/auth/validate";
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
}
