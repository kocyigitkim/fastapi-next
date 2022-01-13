import { NextContextBase } from "../NextContext";
import { NextAuthorizationBase } from "./NextAuthorizationBase";
export interface NextRole {
    Id: any;
    Name: string;
}
export interface NextPermission {
    Id: any;
    Path: string;
}
export interface NextUser {
    Id: any;
}
export declare type RetrieveCurrentUserDelegate = (ctx: NextContextBase) => Promise<NextUser>;
export declare type RetrieveUserRoleDelegate = (ctx: NextContextBase, UserId: any) => Promise<NextRole>;
export declare type RetrieveRolePermissionDelegate = (ctx: NextContextBase, RoleId: any) => Promise<NextPermission[]>;
export declare type ModifyRequestedPathDelegate = (requestPath: string) => string;
export declare class NextAuthorization extends NextAuthorizationBase {
    retrieveCurrentUser?: RetrieveCurrentUserDelegate;
    retrieveUserRole?: RetrieveUserRoleDelegate;
    retrieveRolePermissions?: RetrieveRolePermissionDelegate;
    modifyRequestedPath?: ModifyRequestedPathDelegate;
    constructor();
    check(ctx: NextContextBase): Promise<boolean>;
}
//# sourceMappingURL=NextAuthorization.d.ts.map