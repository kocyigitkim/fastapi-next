import { NextApplication } from "../../NextApplication";
import { NextAuthenticationResult } from "../NextAuthenticationResult";
import { NextPlugin } from "../../plugins/NextPlugin";
import { NextContextBase } from "../../NextContext";
import { NextFlag } from "../../NextFlag";
import { NextHealthCheckStatus } from "../../config/NextOptions";


export class NextAuthenticationPlugin extends NextPlugin<any> {
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
