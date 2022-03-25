import path from 'path'
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

export type RetrieveCurrentUserDelegate = (ctx: NextContextBase) => Promise<NextUser>;
export type RetrieveUserRoleDelegate = (ctx: NextContextBase, UserId: any) => Promise<NextRole>;
export type RetrieveRolePermissionDelegate = (ctx: NextContextBase, RoleId: any) => Promise<NextPermission[]>;
export type ModifyRequestedPathDelegate = (requestPath: string) => string;

export class NextAuthorization extends NextAuthorizationBase {
    public retrieveCurrentUser?: RetrieveCurrentUserDelegate;
    public retrieveUserRole?: RetrieveUserRoleDelegate;
    public retrieveRolePermissions?: RetrieveRolePermissionDelegate;
    public modifyRequestedPath?: ModifyRequestedPathDelegate;
    constructor() {
        super();
    }

    public async check(ctx: NextContextBase): Promise<boolean> {
        if (!this.retrieveCurrentUser) {
            throw new Error("retrieveCurrentUser is not defined");
        }
        if (!this.retrieveUserRole) {
            throw new Error("retrieveUserRole is not defined");
        }
        if (!this.retrieveRolePermissions) {
            throw new Error("retrieveRolePermissions is not defined");
        }
        const user = await this.retrieveCurrentUser(ctx);
        if (!user) {
            return false;
        }
        const role = await this.retrieveUserRole(ctx, user.Id);
        if (!role) {
            const permissions = await this.retrieveRolePermissions(ctx, role.Id);
            if (permissions.length === 0) {
                return false;
            }
            else {
                var requestedPath = path.normalize(ctx.path).replace(/\\/g, "/");
                if (this.modifyRequestedPath) {
                    requestedPath = this.modifyRequestedPath(requestedPath);
                }
                return Boolean(permissions.find(p => {
                    var currentPath = path.normalize((p.Path || "")).replace(/\\/g, "/")
                    // ? if star is used, it means all paths
                    if(currentPath === '*'){
                        return true;
                    }
                    // ? if ends with star and starts with permission path, it means all paths
                    if(currentPath.endsWith('*')){
                        return currentPath.substring(0, currentPath.length - 1) === requestedPath;
                    }
                    return requestedPath == currentPath;
                }));
            }
        }
        return false;
    }
}