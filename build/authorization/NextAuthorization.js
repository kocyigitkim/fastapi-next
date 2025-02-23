"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextAuthorization = void 0;
const path_1 = __importDefault(require("path"));
const NextAuthorizationBase_1 = require("./NextAuthorizationBase");
class NextAuthorization extends NextAuthorizationBase_1.NextAuthorizationBase {
    constructor() {
        super();
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
        if (ctx.app.jwtController) {
            const jwtOptions = ctx.app.options.security.jwt;
            if (jwtOptions) {
                if (Array.isArray(jwtOptions === null || jwtOptions === void 0 ? void 0 : jwtOptions.anonymousPaths)) {
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
        const role = await this.retrieveUserRole(ctx, user.Id);
        if (role) {
            const permissions = await this.retrieveRolePermissions(ctx, role.Id);
            if (permissions.length === 0) {
                return false;
            }
            else {
                var requestedPath = path_1.default.normalize(ctx.path).replace(/\\/g, "/");
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
                    var currentPath = path_1.default.normalize((p.Path || "")).replace(/\\/g, "/");
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
exports.NextAuthorization = NextAuthorization;
