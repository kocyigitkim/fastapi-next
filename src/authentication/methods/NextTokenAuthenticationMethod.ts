import { NextContextBase } from "../../NextContext";
import { NextToken } from "../../structure/NextToken";
import { NextAuthenticationMethod } from "../NextAuthenticationMethod";
import { NextAuthenticationResult } from "../NextAuthenticationResult";

export type RetrieveTokenDelegate = (ctx: NextContextBase, token: string) => Promise<NextToken>;

export class NextTokenAuthenticationMethod extends NextAuthenticationMethod {
    public static methodName = "Token";
    constructor(public RetrieveToken?: RetrieveTokenDelegate) {
        super();
        // disable validation
        this.validatePath = undefined;
    }

    public async login(context: NextContextBase): Promise<NextAuthenticationResult> {
        var result = new NextAuthenticationResult();
        const token = (context.body as any).token;

        if (token) {
            var user = await this.RetrieveToken(context, token).catch(console.error);
            if (user) {
                (context.session as any).user = user;
                (context.session as any).authenticationMethod = this;
                result.success = true;
            }
            else {
                result.success = false;
                result.error = "invalid token";
            }
        }
        else {
            result.success = false;
            result.error = "invalid token";
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
