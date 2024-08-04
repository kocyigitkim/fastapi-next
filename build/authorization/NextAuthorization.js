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
