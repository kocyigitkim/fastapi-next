import path from 'path'
import { match } from 'path-to-regexp'
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
    private pathMatcherCache: Map<string, (p: string) => boolean> = new Map();
    
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
                    // Normalize role shape to have Id/Name regardless of source casing
                    const first: any = roles[0] as any;
                    return {
                        Id: (first?.Id ?? first?.id),
                        Name: (first?.Name ?? first?.name)
                    } as NextRole;
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
                    // When RoleId is provided, collect only that role's permissions.
                    // If RoleId is null/undefined, aggregate across all roles.
                    const roleList = (RoleId === undefined || RoleId === null)
                        ? roles
                        : roles.filter((r: any) => ((r as any)?.Id ?? (r as any)?.id) == RoleId);

                    const seen = new Set<string>();
                    const aggregated: string[] = [];
                    for (const role of roleList as any[]) {
                        const perms: string[] = (role?.permissions || []) as string[];
                        for (const p of perms) {
                            if (!seen.has(p)) {
                                seen.add(p);
                                aggregated.push(p);
                            }
                        }
                    }

                    return aggregated.map(permission => ({
                        Path: permission,
                        Id: permission
                    }));
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
                    // When TeamId is provided, collect only that team's permissions.
                    // If TeamId is null/undefined, aggregate across all teams.
                    const teamList = (TeamId === undefined || TeamId === null)
                        ? teams as any[]
                        : (teams as any[]).filter(t => ((t as any)?.Id ?? (t as any)?.id) == TeamId);
                    const seen = new Set<string>();
                    const aggregated: string[] = [];
                    for (const team of teamList) {
                        const perms: string[] = (team as any)?.permissions || [];
                        for (const p of perms) {
                            if (!seen.has(p)) {
                                seen.add(p);
                                aggregated.push(p);
                            }
                        }
                    }
                    return aggregated.map(permission => ({ Path: permission, Id: permission }));
                }
                return [];
            };
        }
    }

    private hasPermissionForPath(permissions: NextPermission[], requestedPath: string): boolean {
        const normalizedRequest = this.normalizePath(requestedPath);
        for (const perm of permissions) {
            const pattern = this.normalizePattern((perm as any)?.Path);
            if (!pattern) continue;

            // '*' => allow all
            if (pattern === '*') return true;

            // Trailing '*' => prefix match (fast path)
            if (typeof pattern === 'string') {
                if (pattern.length > 1 && pattern.endsWith('*')) {
                    const prefix = pattern.slice(0, -1);
                    if (normalizedRequest.startsWith(prefix)) return true;
                }
            }

            // RegExp support (if provided by custom retrievals)
            if (pattern instanceof RegExp) {
                if ((pattern as unknown as RegExp).test(normalizedRequest)) return true;
                continue;
            }

            // Express-style dynamic routes via path-to-regexp
            if (typeof pattern === 'string') {
                const matcher = this.getMatcher(pattern);
                if (matcher(normalizedRequest)) return true;
            }
        }
        return false;
    }

    private normalizePath(p?: string): string {
        if (!p) return '/';
        const n = path.normalize(p).replace(/\\/g, '/');
        // ensure it starts with '/'
        return n.startsWith('/') ? n : `/${n}`;
    }

    private normalizePattern(p?: unknown): string | RegExp | undefined {
        if (!p) return undefined;
        if (p instanceof RegExp) return p;
        let s = String(p).trim();
        if (s === '*') return '*';
        s = s.replace(/\\/g, '/');
        // normalize '//' and ensure leading slash for paths (except if it's a full wildcard)
        if (!s.startsWith('/')) s = `/${s}`;
        // collapse multiple slashes
        s = s.replace(/\/+/g, '/');
        return s;
    }

    private getMatcher(pattern: string): (path: string) => boolean {
        let fn = this.pathMatcherCache.get(pattern);
        if (fn) return fn;

        // Convert simple glob-like patterns inside segments to a matcher where feasible
        // Example: '/users/*' => prefix path handled earlier; here we keep pattern as-is for param matching like '/users/:id'
        const m = match(pattern, {
            decode: decodeURIComponent,
            sensitive: false,
            end: true
        });
        fn = (p: string) => {
            const target = this.normalizePath(p);
            if (m(target)) return true;
            // Try toggling trailing slash to emulate Express's non-strict behavior
            if (target !== '/') {
                if (target.endsWith('/')) return Boolean(m(target.slice(0, -1)));
                return Boolean(m(`${target}/`));
            }
            return false;
        };
        this.pathMatcherCache.set(pattern, fn);
        return fn;
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
            if (jwtOptions && Array.isArray(jwtOptions?.anonymousPaths)) {
                const anonReqPath = this.normalizePath(ctx.path);
                for (const p of jwtOptions.anonymousPaths) {
                    if (p instanceof RegExp) {
                        if (p.test(anonReqPath)) return true;
                        continue;
                    }
                    const pattern = this.normalizePattern(p as unknown as string);
                    if (!pattern) continue;
                    if (pattern === '*') return true;
                    if (typeof pattern === 'string' && pattern.endsWith('*')) {
                        const prefix = pattern.slice(0, -1);
                        if (anonReqPath.startsWith(prefix)) return true;
                        continue;
                    }
                    if (typeof pattern === 'string') {
                        const matcher = this.getMatcher(pattern);
                        if (matcher(anonReqPath)) return true;
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
                role: await this.retrieveUserRole(ctx, (user as any)?.Id ?? (user as any)?.id),
                permissions: [],
                requestedPath
            });
            return Boolean((r instanceof Promise) ? (await r.catch(console.error) || false) : r);
        }
        
        // ? Record based authozization
        if (this.retrieveAuthorizedRecord) {
            const role = await this.retrieveUserRole(ctx, (user as any)?.Id ?? (user as any)?.id);
            const permissions = await this.retrieveRolePermissions(ctx, role.Id);
            var authRecordStatus = await this.retrieveAuthorizedRecord(ctx, user, role, permissions);
            if (authRecordStatus.success && authRecordStatus.name) {
                ctx.items[authRecordStatus.name] = authRecordStatus.data;
            }
            return authRecordStatus.success;
        }
        
        // ? Default authorization - Role based
        const role = await this.retrieveUserRole(ctx, (user as any)?.Id ?? (user as any)?.id);
        if (role) {
            // 1) Try aggregated permissions directly from session roles (handles multi-role users)
            const sessionRoles: any[] = Array.isArray((user as any)?.roles) ? (user as any).roles : [];
            if (sessionRoles.length > 0) {
                const dedup = new Set<string>();
                for (const sr of sessionRoles) {
                    const perms: string[] = (sr?.permissions || []) as string[];
                    for (const p of perms) dedup.add(p);
                }
                const aggregated = Array.from(dedup).map(p => ({ Path: p, Id: p }));
                if (this.hasPermissionForPath(aggregated, requestedPath)) {
                    return true;
                }
            }

            // 2) Fall back to delegate-based retrieval (keeps custom strategies working)
            const rolePermissions = await this.retrieveRolePermissions(ctx, (role as any)?.Id ?? (role as any)?.id);
            if (this.hasPermissionForPath(rolePermissions, requestedPath)) {
                return true;
            }
        }
        
        // ? Team based authorization (optional)
        if (this.enableTeamAuthorization && this.retrieveUserTeams && this.retrieveTeamPermissions) {
            const teams = await this.retrieveUserTeams(ctx, (user as any)?.Id ?? (user as any)?.id);
            if (teams && teams.length > 0) {
                for (const team of teams) {
                    const teamPermissions = await this.retrieveTeamPermissions(ctx, (team as any)?.Id ?? (team as any)?.id);
                    if (this.hasPermissionForPath(teamPermissions, requestedPath)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
}
