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
                var _a, _b, _c, _d;
                const user = (_b = (_a = ctx.session) === null || _a === void 0 ? void 0 : _a.nextAuthentication) === null || _b === void 0 ? void 0 : _b.user;
                const roles = user === null || user === void 0 ? void 0 : user.roles;
                if (Array.isArray(roles) && roles.length > 0) {
                    // Normalize role shape to have Id/Name regardless of source casing
                    const first = roles[0];
                    return {
                        Id: ((_c = first === null || first === void 0 ? void 0 : first.Id) !== null && _c !== void 0 ? _c : first === null || first === void 0 ? void 0 : first.id),
                        Name: ((_d = first === null || first === void 0 ? void 0 : first.Name) !== null && _d !== void 0 ? _d : first === null || first === void 0 ? void 0 : first.name)
                    };
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
                    // When RoleId is provided, collect only that role's permissions.
                    // If RoleId is null/undefined, aggregate across all roles.
                    const roleList = (RoleId === undefined || RoleId === null)
                        ? roles
                        : roles.filter((r) => { var _a; return ((_a = r === null || r === void 0 ? void 0 : r.Id) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.id) == RoleId; });
                    const seen = new Set();
                    const aggregated = [];
                    for (const role of roleList) {
                        const perms = ((role === null || role === void 0 ? void 0 : role.permissions) || []);
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
                    // When TeamId is provided, collect only that team's permissions.
                    // If TeamId is null/undefined, aggregate across all teams.
                    const teamList = (TeamId === undefined || TeamId === null)
                        ? teams
                        : teams.filter(t => { var _a; return ((_a = t === null || t === void 0 ? void 0 : t.Id) !== null && _a !== void 0 ? _a : t === null || t === void 0 ? void 0 : t.id) == TeamId; });
                    const seen = new Set();
                    const aggregated = [];
                    for (const team of teamList) {
                        const perms = (team === null || team === void 0 ? void 0 : team.permissions) || [];
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
        var _a, _b, _c, _d, _e, _f;
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
                role: await this.retrieveUserRole(ctx, (_a = user === null || user === void 0 ? void 0 : user.Id) !== null && _a !== void 0 ? _a : user === null || user === void 0 ? void 0 : user.id),
                permissions: [],
                requestedPath
            });
            return Boolean((r instanceof Promise) ? (await r.catch(console.error) || false) : r);
        }
        // ? Record based authozization
        if (this.retrieveAuthorizedRecord) {
            const role = await this.retrieveUserRole(ctx, (_b = user === null || user === void 0 ? void 0 : user.Id) !== null && _b !== void 0 ? _b : user === null || user === void 0 ? void 0 : user.id);
            const permissions = await this.retrieveRolePermissions(ctx, role.Id);
            var authRecordStatus = await this.retrieveAuthorizedRecord(ctx, user, role, permissions);
            if (authRecordStatus.success && authRecordStatus.name) {
                ctx.items[authRecordStatus.name] = authRecordStatus.data;
            }
            return authRecordStatus.success;
        }
        // ? Default authorization - Role based
        const role = await this.retrieveUserRole(ctx, (_c = user === null || user === void 0 ? void 0 : user.Id) !== null && _c !== void 0 ? _c : user === null || user === void 0 ? void 0 : user.id);
        if (role) {
            // 1) Try aggregated permissions directly from session roles (handles multi-role users)
            const sessionRoles = Array.isArray(user === null || user === void 0 ? void 0 : user.roles) ? user.roles : [];
            if (sessionRoles.length > 0) {
                const dedup = new Set();
                for (const sr of sessionRoles) {
                    const perms = ((sr === null || sr === void 0 ? void 0 : sr.permissions) || []);
                    for (const p of perms)
                        dedup.add(p);
                }
                const aggregated = Array.from(dedup).map(p => ({ Path: p, Id: p }));
                if (this.hasPermissionForPath(aggregated, requestedPath)) {
                    return true;
                }
            }
            // 2) Fall back to delegate-based retrieval (keeps custom strategies working)
            const rolePermissions = await this.retrieveRolePermissions(ctx, (_d = role === null || role === void 0 ? void 0 : role.Id) !== null && _d !== void 0 ? _d : role === null || role === void 0 ? void 0 : role.id);
            if (this.hasPermissionForPath(rolePermissions, requestedPath)) {
                return true;
            }
        }
        // ? Team based authorization (optional)
        if (this.enableTeamAuthorization && this.retrieveUserTeams && this.retrieveTeamPermissions) {
            const teams = await this.retrieveUserTeams(ctx, (_e = user === null || user === void 0 ? void 0 : user.Id) !== null && _e !== void 0 ? _e : user === null || user === void 0 ? void 0 : user.id);
            if (teams && teams.length > 0) {
                for (const team of teams) {
                    const teamPermissions = await this.retrieveTeamPermissions(ctx, (_f = team === null || team === void 0 ? void 0 : team.Id) !== null && _f !== void 0 ? _f : team === null || team === void 0 ? void 0 : team.id);
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
