"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextAuthorization = void 0;
const path_1 = __importDefault(require("path"));
const path_to_regexp_1 = require("path-to-regexp");
const NextAuthorizationBase_1 = require("./NextAuthorizationBase");
class NextAuthorization extends NextAuthorizationBase_1.NextAuthorizationBase {
    constructor() {
        super();
        this.enableTeamAuthorization = false;
        this.pathMatcherCache = new Map();
    }
    async init() {
        if (!this.retrieveCurrentUser) {
            this.retrieveCurrentUser = async (ctx) => {
                var _a, _b;
                const user = (_b = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.nextAuthentication) === null || _b === void 0 ? void 0 : _b.user;
                return user;
            };
        }
        if (!this.retrieveUserRole) {
            this.retrieveUserRole = async (ctx, UserId) => {
                var _a, _b;
                const user = (_b = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.nextAuthentication) === null || _b === void 0 ? void 0 : _b.user;
                const roles = user === null || user === void 0 ? void 0 : user.roles;
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
            this.retrieveRolePermissions = async (ctx, RoleId) => {
                var _a, _b;
                const user = (_b = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.nextAuthentication) === null || _b === void 0 ? void 0 : _b.user;
                const roles = user === null || user === void 0 ? void 0 : user.roles;
                if (Array.isArray(roles) && roles.length > 0) {
                    let permissions = [];
                    for (var role of roles.filter(r => r.Id == RoleId)) {
                        permissions = permissions.concat((role === null || role === void 0 ? void 0 : role.permissions) || []);
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
            this.retrieveUserTeams = async (ctx, UserId) => {
                var _a, _b;
                const user = (_b = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.nextAuthentication) === null || _b === void 0 ? void 0 : _b.user;
                const teams = user === null || user === void 0 ? void 0 : user.teams;
                if (Array.isArray(teams) && teams.length > 0) {
                    return teams;
                }
                return [];
            };
        }
        if (this.enableTeamAuthorization && !this.retrieveTeamPermissions) {
            this.retrieveTeamPermissions = async (ctx, TeamId) => {
                var _a, _b;
                const user = (_b = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.nextAuthentication) === null || _b === void 0 ? void 0 : _b.user;
                const teams = user === null || user === void 0 ? void 0 : user.teams;
                if (Array.isArray(teams) && teams.length > 0) {
                    let permissions = [];
                    for (var team of teams.filter(t => t.Id == TeamId)) {
                        permissions = permissions.concat((team === null || team === void 0 ? void 0 : team.permissions) || []);
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
    hasPermissionForPath(permissions, requestedPath) {
        const normalizedRequest = this.normalizePath(requestedPath);
        for (const perm of permissions) {
            const pattern = this.normalizePattern(perm === null || perm === void 0 ? void 0 : perm.Path);
            if (!pattern)
                continue;
            // '*' => allow all
            if (pattern === '*')
                return true;
            // Trailing '*' => prefix match (fast path)
            if (typeof pattern === 'string') {
                if (pattern.length > 1 && pattern.endsWith('*')) {
                    const prefix = pattern.slice(0, -1);
                    if (normalizedRequest.startsWith(prefix))
                        return true;
                }
            }
            // RegExp support (if provided by custom retrievals)
            if (pattern instanceof RegExp) {
                if (pattern.test(normalizedRequest))
                    return true;
                continue;
            }
            // Express-style dynamic routes via path-to-regexp
            if (typeof pattern === 'string') {
                const matcher = this.getMatcher(pattern);
                if (matcher(normalizedRequest))
                    return true;
            }
        }
        return false;
    }
    normalizePath(p) {
        if (!p)
            return '/';
        const n = path_1.default.normalize(p).replace(/\\/g, '/');
        // ensure it starts with '/'
        return n.startsWith('/') ? n : `/${n}`;
    }
    normalizePattern(p) {
        if (!p)
            return undefined;
        if (p instanceof RegExp)
            return p;
        let s = String(p).trim();
        if (s === '*')
            return '*';
        s = s.replace(/\\/g, '/');
        // normalize '//' and ensure leading slash for paths (except if it's a full wildcard)
        if (!s.startsWith('/'))
            s = `/${s}`;
        // collapse multiple slashes
        s = s.replace(/\/+/g, '/');
        return s;
    }
    getMatcher(pattern) {
        let fn = this.pathMatcherCache.get(pattern);
        if (fn)
            return fn;
        // Convert simple glob-like patterns inside segments to a matcher where feasible
        // Example: '/users/*' => prefix path handled earlier; here we keep pattern as-is for param matching like '/users/:id'
        const m = (0, path_to_regexp_1.match)(pattern, {
            decode: decodeURIComponent,
            sensitive: false,
            end: true
        });
        fn = (p) => {
            const target = this.normalizePath(p);
            if (m(target))
                return true;
            // Try toggling trailing slash to emulate Express's non-strict behavior
            if (target !== '/') {
                if (target.endsWith('/'))
                    return Boolean(m(target.slice(0, -1)));
                return Boolean(m(`${target}/`));
            }
            return false;
        };
        this.pathMatcherCache.set(pattern, fn);
        return fn;
    }
    async check(ctx, permission) {
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
            if (jwtOptions && Array.isArray(jwtOptions === null || jwtOptions === void 0 ? void 0 : jwtOptions.anonymousPaths)) {
                const anonReqPath = this.normalizePath(ctx.path);
                for (const p of jwtOptions.anonymousPaths) {
                    if (p instanceof RegExp) {
                        if (p.test(anonReqPath))
                            return true;
                        continue;
                    }
                    const pattern = this.normalizePattern(p);
                    if (!pattern)
                        continue;
                    if (pattern === '*')
                        return true;
                    if (typeof pattern === 'string' && pattern.endsWith('*')) {
                        const prefix = pattern.slice(0, -1);
                        if (anonReqPath.startsWith(prefix))
                            return true;
                        continue;
                    }
                    if (typeof pattern === 'string') {
                        const matcher = this.getMatcher(pattern);
                        if (matcher(anonReqPath))
                            return true;
                    }
                }
            }
        }
        const user = await this.retrieveCurrentUser(ctx);
        if (!user) {
            return false;
        }
        var requestedPath = path_1.default.normalize(ctx.path).replace(/\\/g, "/");
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
exports.NextAuthorization = NextAuthorization;
