import { NextContextBase } from "../../NextContext"
import { NextRole, UserRoleStrategy } from "../../structure/NextRole"
import { NextUser } from "../../structure/NextUser"
import { RetrieveUserDelegate } from "../RetrieveUserDelegate"
import crypto from 'crypto'

type EncodePasswordOptions = {
    algorithm: string
    iterations?: number
}

interface RetrieveUserOptions {
    db: any
    userTable: string
    userNameField: string
    passwordField: string
    encryption?: EncodePasswordOptions
    statusField?: string
    desiredStatus?: any
    idField?: string
    emailField?: string
    phoneField?: string
    firstNameField?: string
    lastNameField?: string
    additionalFields?: string[]
    conditions?: (ctx: NextContextBase, username: string, password: string) => Promise<boolean>
    role?: {
        strategy?: UserRoleStrategy
        roleId?: {
            /**  role table name */
            roleTable: string
            /**  the field in the role table that contains the role id */
            roleIdField: string
            /**  the field in the user table that contains the role id */
            relationField: string
        }
        roleJoin?: {
            /** role table name */
            roleTable: string
            /**  the field in the role table that contains the role id */
            roleIdField: string
            /**  the join table name */
            joinTable: string
            /**  the field in the join table that contains the user id */
            joinUserIdField: string
            /**  the field in the join table that contains the role id */
            joinRoleIdField: string
            /**  the field in the join table that defines if the role is deleted or not */
            isDeletedField?: string
            /**  the value that defines if the role is deleted or not */
            isDeletedValue?: any
        },
        permission?: {
            /**  permission table name */
            permissionTable: string
            /**  the field in the permission table that contains the permission id */
            permissionIdField: string
            /**  the field in the permission table that contains the permission name */
            permissionNameField: string
        },
        rolePermission?: {
            /**  role permission table name */
            rolePermissionTable: string
            /**  the field in the role permission table that contains the role id */
            rolePermissionRoleIdField: string
            /**  the field in the role permission table that contains the permission id */
            rolePermissionPermissionIdField: string
            /**  the field in the role permission table that defines if the permission is deleted or not */
            isDeletedField?: string
            /**  the value that defines if the permission is deleted or not */
            isDeletedValue?: any
        },
        custom?: (ctx: NextContextBase, user: NextUser) => Promise<NextRole[]>,
    }
}

function EncodePassword(password: string, options: EncodePasswordOptions, iterations?: number) {
    var result = password;
    switch (options.algorithm) {
        case "sha256":
            result = crypto.createHash("sha256").update(password).digest("hex");
        case "sha512":
            result = crypto.createHash("sha512").update(password).digest("hex");
        case "md5":
            result = crypto.createHash("md5").update(password).digest("hex");
        default:
            result = password;
    }
    if (options.iterations && options.iterations > iterations) {
        result = EncodePassword(result, options, iterations + 1);
    }
    return result;
}

export class RetrieveUserBuilder {

    public static Build(options: RetrieveUserOptions): RetrieveUserDelegate {
        return async (ctx: NextContextBase, username: string, password: string) => {
            var passwordToCheck = options.encryption ? EncodePassword(password, options.encryption, 0) : password;
            var db = options.db;
            if (typeof db === "function")
                db = db(ctx);
            if (db instanceof Promise)
                db = await db.catch(console.error);
            var query = db(options.userTable).select("*").where(options.userNameField, username).where(options.passwordField, passwordToCheck);
            if (options.statusField) {
                query = query.where(options.statusField, options.desiredStatus);
            }
            var result = await query.first().catch(console.error);
            if (result) {
                var user = new NextUser();
                user.id = result[options.idField || "id"];
                if (options.emailField)
                    user.email = result[options.emailField];
                if (options.phoneField)
                    user.phone = result[options.phoneField];
                if (options.firstNameField)
                    user.name = result[options.firstNameField];
                if (options.lastNameField)
                    user.surname = result[options.lastNameField];
                if (options.userNameField)
                    user.userName = result[options.userNameField];
                if (Array.isArray(options.additionalFields)) {
                    user.additionalInfo = {};
                    options.additionalFields.forEach(field => {
                        user.additionalInfo[field] = result[field];
                    });
                }
                if (options.role) {
                    if (options.role.strategy == UserRoleStrategy.RoleId) {
                        var roles = await db(options.role.roleId.roleTable).select("*").where(options.role.roleId.roleIdField, result[options.role.roleId.relationField]).select().catch(console.error);
                        if (Array.isArray(roles)) {
                            var roleIds = roles.map(role => role[options.role.roleId.roleIdField]);
                            var permissions = await db(options.role.rolePermission.rolePermissionTable).select("*").whereIn(options.role.rolePermission.rolePermissionRoleIdField, roleIds).catch(console.error);
                            if (Array.isArray(permissions)) {
                                var permissionIds = permissions.map(permission => permission[options.role.rolePermission.rolePermissionPermissionIdField]);
                                var permissionNames = await db(options.role.permission.permissionTable).select("*").whereIn(options.role.permission.permissionIdField, permissionIds).catch(console.error);
                                if (Array.isArray(permissionNames)) {
                                    roles.forEach(role => {
                                        role.permissions = permissions.filter(permission => permission[options.role.rolePermission.rolePermissionRoleIdField] == role[options.role.roleId.roleIdField]).map(permission => {
                                            return permissionNames.find(permissionName => permissionName[options.role.permission.permissionIdField] == permission[options.role.rolePermission.rolePermissionPermissionIdField])[options.role.permission.permissionNameField];
                                        });
                                    });
                                }
                            }

                            user.roles = roles.map(role => {
                                var r = new NextRole();
                                r.id = role[options.role.roleId.roleIdField];
                                r.name = role.name;
                                r.description = role.description;
                                r.permissions = role.permissions;
                                return r;
                            });
                        }
                        else{
                            user.roles = [];
                        }
                    }
                    else if (options.role.strategy == UserRoleStrategy.RoleJoin){
                        var roles = await db(options.role.roleJoin.joinTable).select("*").where(options.role.roleJoin.joinUserIdField, result[options.idField]).select().catch(console.error);
                        if (Array.isArray(roles)) {
                            var roleIds = roles.map(role => role[options.role.roleJoin.joinRoleIdField]);
                            var permissions = await db(options.role.rolePermission.rolePermissionTable).select("*").whereIn(options.role.rolePermission.rolePermissionRoleIdField, roleIds).catch(console.error);
                            if (Array.isArray(permissions)) {
                                var permissionIds = permissions.map(permission => permission[options.role.rolePermission.rolePermissionPermissionIdField]);
                                var permissionNames = await db(options.role.permission.permissionTable).select("*").whereIn(options.role.permission.permissionIdField, permissionIds).catch(console.error);
                                if (Array.isArray(permissionNames)) {
                                    roles.forEach(role => {
                                        role.permissions = permissions.filter(permission => permission[options.role.rolePermission.rolePermissionRoleIdField] == role[options.role.roleJoin.joinRoleIdField]).map(permission => {
                                            return permissionNames.find(permissionName => permissionName[options.role.permission.permissionIdField] == permission[options.role.rolePermission.rolePermissionPermissionIdField])[options.role.permission.permissionNameField];
                                        });
                                    });
                                }
                            }

                            user.roles = roles.map(role => {
                                var r = new NextRole();
                                r.id = role[options.role.roleJoin.joinRoleIdField];
                                r.name = role.name;
                                r.description = role.description;
                                r.permissions = role.permissions;
                                return r;
                            });
                        }
                        else{
                            user.roles = [];
                        }
                    }
                    else if (options.role.strategy == UserRoleStrategy.Custom){
                        user.roles = await options.role.custom(ctx, result);
                    }
                    else{
                        user.roles = [];
                    }
                    return user;
                }
                else {
                    return user;
                }
            }
        }
    }
}