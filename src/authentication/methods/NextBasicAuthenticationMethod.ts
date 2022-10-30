import { NextContextBase } from "../../NextContext";
import { NextAuthenticationMethod } from "../NextAuthenticationMethod";
import { NextAuthenticationResult } from "../NextAuthenticationResult";

export class NextBasicAuthenticationMethod extends NextAuthenticationMethod {

    public async login(context: NextContextBase): Promise<NextAuthenticationResult> {
        var result = new NextAuthenticationResult();
        const username = (context.body as any).username;
        const password = (context.body as any).password;

        if (username && password) {
            
        }
        else {
            result.success = false;
            result.error = "invalid username or password";
        }

        return result;
    }
}