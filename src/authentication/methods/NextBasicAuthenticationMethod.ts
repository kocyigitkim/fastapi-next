import { NextContextBase } from "../../NextContext";
import { NextUser } from "../../structure/NextUser";
import { NextAuthenticationMethod } from "../NextAuthenticationMethod";
import { NextAuthenticationResult } from "../NextAuthenticationResult";

type RetrieveUserDelegate = (ctx: NextContextBase, username: string, password: string) => Promise<NextUser>;

export class NextBasicAuthenticationMethod extends NextAuthenticationMethod {
    public static methodName = "Basic";
    constructor(public RetrieveUser?: RetrieveUserDelegate) {
        super();
        // disable validation
        this.validatePath = undefined;
    }

    public async login(context: NextContextBase): Promise<NextAuthenticationResult> {
        var result = new NextAuthenticationResult();
        const username = (context.body as any).username;
        const password = (context.body as any).password;

        if (username && password) {
            var user = await this.RetrieveUser(context, username, password).catch(console.error);
            if (user) {
                (context.session as any).user = user;
                (context.session as any).authenticationMethod = this;
                result.success = true;
            }
            else {
                result.success = false;
                result.error = "Invalid username or password";
            }
        }
        else {
            result.success = false;
            result.error = "invalid username or password";
        }

        return result;
    }
    public async logout(context: NextContextBase): Promise<NextAuthenticationResult> {
        var result = new NextAuthenticationResult();
        if (context.session) {
            delete (context.session as any).user;
            delete (context.session as any).authenticationMethod;
            result.success = true;
        }
        else {
            result.success = false;
            result.error = "Not logged in";
        }
        return result;
    }
    public async info(context: NextContextBase): Promise<NextAuthenticationResult> {
        var result = new NextAuthenticationResult();
        if (context.session) {
            if ((context.session as any).user) {
                result.success = true;
                result.user = (context.session as any).user;
            }
            else {
                result.success = false;
                result.error = "Not logged in";
            }
        }
        else {
            result.success = false;
            result.error = "Not logged in";
        }
        return result;
    }

}

