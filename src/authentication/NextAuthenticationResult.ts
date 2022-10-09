import { NextUser } from "../structure/NextUser";
import { NextAuthenticationValidationCode } from "./NextAuthenticationValidationCode";


export class NextAuthenticationResult {
    public success: boolean;
    public error?: string;
    public additionalInfo?: any;
    public user?: NextUser;
    public validationCode?: NextAuthenticationValidationCode;
    public method?: string;
}
