import path from 'path'
import { NextContextBase } from "../NextContext";
import { NextAuthorizationBase } from "./NextAuthorizationBase";
import { NextPermissionDefinition } from './NextPermission';
import { NextUser as NextUserExtended } from '../structure/NextUser';
import { NextRole as NextRoleExtended } from '../structure/NextRole';

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
export interface NextTeam {
    Id: any;
    Name: string;
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
export type RetrieveUserTeamsDelegate = (ctx: NextContextBase, UserId: any) => Promise<NextTeam[]>;
export type RetrieveTeamPermissionsDelegate = (ctx: NextContextBase, TeamId: any) => Promise<NextPermission[]>;
export type ModifyRequestedPathDelegate = (requestPath: string) => string;

export class NextAuthorization extends NextAuthorizationBase {
    public retrieveCurrentUser?: RetrieveCurrentUserDelegate;
    public retrieveUserRole?: RetrieveUserRoleDelegate;
    public retrieveRolePermissions?: RetrieveRolePermissionDelegate;
    public retrieveAuthorizedRecord?: RetrieveAuthorizedRecord;
    public modifyRequestedPath?: ModifyRequestedPathDelegate;
    public retrieveUserTeams?: RetrieveUserTeamsDelegate;
    public retrieveTeamPermissions?: RetrieveTeamPermissionsDelegate;
    public enableTeamAuthorization: boolean = false;
    
    constructor() {
        super();
    }

    async init() {
        if (!this.retrieveCurrentUser) {
            this.retrieveCurrentUser = async (ctx: NextContextBase) => {
                const user: NextUser = (ctx.session as any)?.nextAuthentication?.user;
                return user;
            };
        }
        if (!this.retrieveUserRole) {
            this.retrieveUserRole = async (ctx: NextContextBase, UserId: any) => {
                const user: NextUser = (ctx.session as any)?.nextAuthentication?.user;
                const roles: NextRole[] = (user as any)?.roles;
                if (Array.isArray(roles) && roles.length > 0) {
                    return roles[0];
                }
                return {
                    Id: 0,
                    Name: "anonymous"
                };
            };
        }
        if (!this.retrieveRolePermissions) {
            this.retrieveRolePermissions = async (ctx: NextContextBase, RoleId: any) => {
                const user: NextUser = (ctx.session as any)?.nextAuthentication?.user;
                const roles: NextRole[] = (user as any)?.roles;
                if (Array.isArray(roles) && roles.length > 0) {
                    let permissions: string[] = [];
                    for (var role of roles.filter(r => r.Id == RoleId)) {
                        permissions = permissions.concat((role as any)?.permissions || []);
                    }

                    return permissions.map(permission => {
                        return {
                            Path: permission,
                            Id: permission
                        };
                    });
                }
                return [];
            };
        }
        if (this.enableTeamAuthorization && !this.retrieveUserTeams) {
            this.retrieveUserTeams = async (ctx: NextContextBase, UserId: any) => {
                const user: NextUser = (ctx.session as any)?.nextAuthentication?.user;
                const teams: NextTeam[] = (user as any)?.teams;
                if (Array.isArray(teams) && teams.length > 0) {
                    return teams;
                }
                return [];
            };
        }
        if (this.enableTeamAuthorization && !this.retrieveTeamPermissions) {
            this.retrieveTeamPermissions = async (ctx: NextContextBase, TeamId: any) => {
                const user: NextUser = (ctx.session as any)?.nextAuthentication?.user;
                const teams: NextTeam[] = (user as any)?.teams;
                if (Array.isArray(teams) && teams.length > 0) {
                    let permissions: string[] = [];
                    for (var team of teams.filter(t => t.Id == TeamId)) {
                        permissions = permissions.concat((team as any)?.permissions || []);
                    }

                    return permissions.map(permission => {
                        return {
                            Path: permission,
                            Id: permission
                        };
                    });
                }
                return [];
            };
        }
    }

    private hasPermissionForPath(permissions: NextPermission[], requestedPath: string): boolean {
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
        if (this.enableTeamAuthorization) {
            if (!this.retrieveUserTeams) {
                throw new Error("retrieveUserTeams is not defined but team authorization is enabled");
            }
            if (!this.retrieveTeamPermissions) {
                throw new Error("retrieveTeamPermissions is not defined but team authorization is enabled");
            }
        }
        if (ctx.app.jwtController) {
            const jwtOptions = ctx.app.options.security.jwt;
            if (jwtOptions) {
                if (Array.isArray(jwtOptions?.anonymousPaths)){
                    for (const p of jwtOptions.anonymousPaths) {
                        if (p instanceof RegExp) {
                            if (p.test(ctx.path)) {
                                return true;
                            }
                        }
                        else {
                            if (p == ctx.path) {
                                return true;
                            }
                        }

                    }
                }
            }
        }
        const user = await this.retrieveCurrentUser(ctx);
        if (!user) {
            return false;
        }
        
        var requestedPath = path.normalize(ctx.path).replace(/\\/g, "/");
        if (this.modifyRequestedPath) {
            requestedPath = this.modifyRequestedPath(requestedPath);
        }
        
        // ? Custom authorization
        if (permission && permission.custom) {
            var r = permission.custom({
                ctx,
                user,
                role: await this.retrieveUserRole(ctx, user.Id),
                permissions: [],
                requestedPath
            });
            return Boolean((r instanceof Promise) ? (await r.catch(console.error) || false) : r);
        }
        
        // ? Record based authozization
        if (this.retrieveAuthorizedRecord) {
            const role = await this.retrieveUserRole(ctx, user.Id);
            const permissions = await this.retrieveRolePermissions(ctx, role.Id);
            var authRecordStatus = await this.retrieveAuthorizedRecord(ctx, user, role, permissions);
            if (authRecordStatus.success && authRecordStatus.name) {
                ctx.items[authRecordStatus.name] = authRecordStatus.data;
            }
            return authRecordStatus.success;
        }
        
        // ? Default authorization - Role based
        const role = await this.retrieveUserRole(ctx, user.Id);
        if (role) {
            const rolePermissions = await this.retrieveRolePermissions(ctx, role.Id);
            if (this.hasPermissionForPath(rolePermissions, requestedPath)) {
                return true;
            }
        }
        
        // ? Team based authorization (optional)
        if (this.enableTeamAuthorization && this.retrieveUserTeams && this.retrieveTeamPermissions) {
            const teams = await this.retrieveUserTeams(ctx, user.Id);
            if (teams && teams.length > 0) {
                for (const team of teams) {
                    const teamPermissions = await this.retrieveTeamPermissions(ctx, team.Id);
                    if (this.hasPermissionForPath(teamPermissions, requestedPath)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
}