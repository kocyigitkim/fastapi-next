import { NextContextBase } from "../../NextContext";
import { NextUser } from "../../structure/NextUser";
import { makeType } from "../../utils";
import { NextAuthenticationMethod } from "../NextAuthenticationMethod";
import { NextAuthenticationResult } from "../NextAuthenticationResult";
import { NextAuthenticationValidationCode } from "../NextAuthenticationValidationCode";
import { NextAuthenticationMethodRegistry } from "./NextAuthenticationMethodRegistry";

type RetrieveUserDelegate = (ctx: NextContextBase, username: string, password: string) => Promise<NextUser>;
type WhenCodeGeneratedDelegate = (ctx: NextContextBase, user: NextUser, code: NextAuthenticationValidationCode) => Promise<void>;
export class NextTwoFactorAuthenticationMethod extends NextAuthenticationMethod {
    public static methodName = "2FA";
    public secureCodeLength = 6;
    constructor(public RetrieveUser?: RetrieveUserDelegate, public WhenCodeGenerated?: WhenCodeGeneratedDelegate) {
        super();
        this.basePath = "/auth/2fa";
    }
    public async login(context: NextContextBase): Promise<NextAuthenticationResult> {
        var result = new NextAuthenticationResult();
        const username = (context.body as any).username;
        const password = (context.body as any).password;

        if (username && password) {
            var user = await this.RetrieveUser(context, username, password).catch(console.error);
            if (user) {
                result.additionalInfo = {
                    "2FA": true
                };
                result.validationCode = new NextAuthenticationValidationCode(this.generateSecureCode(this.secureCodeLength));
                if (this.WhenCodeGenerated) {
                    await this.WhenCodeGenerated(context, user, result.validationCode).catch(console.error);
                }
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
                var isGranted = false;
                var authenticationResult: NextAuthenticationResult = null;
                if (context.session) {
                    authenticationResult = (context.session as any).nextAuthentication;
                }
                if (authenticationResult && authenticationResult.validationCode) {
                    if (authenticationResult.additionalInfo) {
                        if (Boolean(authenticationResult.additionalInfo["validationCode"])) {
                            isGranted = true;
                        }
                    }
                }
                if (isGranted) {
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
        }
        else {
            result.success = false;
            result.error = "Not logged in";
        }
        return result;
    }
    public async validate(context: NextContextBase): Promise<NextAuthenticationResult> {
        var result = new NextAuthenticationResult();
        if (context.session) {
            if ((context.session as any).user && (context.session as any).authenticationMethod) {
                var auth = makeType(NextAuthenticationResult, context.session['nextAuthentication']) as NextAuthenticationResult;
                if (auth.validationCode == context.body['code']) {

                    result.success = true;
                    result.user = (context.session as any).user;
                }
                else {
                    result.success = false;
                    result.error = "Invalid code";
                }
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
