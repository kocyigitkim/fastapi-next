import { NextContextBase } from "../NextContext";
import { NextAuthorizationBase } from "./NextAuthorizationBase";
import { NextPermissionDefinition } from './NextPermission';
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
export interface AuthorizedRecordResult {
    success: boolean;
    data: any;
    name?: string;
}
export type RetrieveAuthorizedRecord = (ctx: NextContextBase, user: NextUser, role: NextRole, permissions: NextPermission[]) => Promise<AuthorizedRecordResult>;
export type RetrieveCurrentUserDelegate = (ctx: NextContextBase) => Promise<NextUser>;
export type RetrieveUserRoleDelegate = (ctx: NextContextBase, UserId: any) => Promise<NextRole>;
export type RetrieveRolePermissionDelegate = (ctx: NextContextBase, RoleId: any) => Promise<NextPermission[]>;
export type ModifyRequestedPathDelegate = (requestPath: string) => string;
export declare class NextAuthorization extends NextAuthorizationBase {
    retrieveCurrentUser?: RetrieveCurrentUserDelegate;
    retrieveUserRole?: RetrieveUserRoleDelegate;
    retrieveRolePermissions?: RetrieveRolePermissionDelegate;
    retrieveAuthorizedRecord?: RetrieveAuthorizedRecord;
    modifyRequestedPath?: ModifyRequestedPathDelegate;
    constructor();
    check(ctx: NextContextBase, permission: NextPermissionDefinition): Promise<boolean>;
}
//# sourceMappingURL=NextAuthorization.d.ts.map