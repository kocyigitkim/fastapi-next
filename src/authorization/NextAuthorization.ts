import path from 'path'
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

export class NextAuthorization extends NextAuthorizationBase {
    public retrieveCurrentUser?: RetrieveCurrentUserDelegate;
    public retrieveUserRole?: RetrieveUserRoleDelegate;
    public retrieveRolePermissions?: RetrieveRolePermissionDelegate;
    public retrieveAuthorizedRecord?: RetrieveAuthorizedRecord;
    public modifyRequestedPath?: ModifyRequestedPathDelegate;
    constructor() {
        super();
    }

    public async check(ctx: NextContextBase, permission: NextPermissionDefinition): Promise<boolean> {
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
        if (role) {
            const permissions = await this.retrieveRolePermissions(ctx, role.Id);
            if (permissions.length === 0) {
                return false;
            }
            else {
                var requestedPath = path.normalize(ctx.path).replace(/\\/g, "/");
                if (this.modifyRequestedPath) {
                    requestedPath = this.modifyRequestedPath(requestedPath);
                }
                // ? Custom authorization
                if (permission && permission.custom) {
                    var r = permission.custom({
                        ctx,
                        user,
                        role,
                        permissions,
                        requestedPath
                    });
                    return Boolean((r instanceof Promise) ? (await r.catch(console.error) || false) : r);
                }
                // ? Record based authozization
                if (this.retrieveAuthorizedRecord) {
                    var authRecordStatus = await this.retrieveAuthorizedRecord(ctx, user, role, permissions);
                    if (authRecordStatus.success && authRecordStatus.name) {
                        ctx.items[authRecordStatus.name] = authRecordStatus.data;
                    }
                    return authRecordStatus.success;
                }
                // ? Default authorization
                return Boolean(permissions.find(p => {
                    var currentPath = path.normalize((p.Path || "")).replace(/\\/g, "/")
                    // ? if star is used, it means all paths
                    if (currentPath === '*') {
                        return true;
                    }
                    // ? if ends with star and starts with permission path, it means all paths
                    if (currentPath.endsWith('*')) {
                        return currentPath.substring(0, currentPath.length - 1) === requestedPath;
                    }
                    return requestedPath == currentPath;
                }));
            }
        }
        return false;
    }
}