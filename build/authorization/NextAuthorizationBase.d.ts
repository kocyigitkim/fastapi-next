import { NextContextBase } from "..";
import { NextPermissionDefinition } from "./NextPermission";
export declare class NextAuthorizationBase {
    check(ctx: NextContextBase, permission: NextPermissionDefinition): Promise<boolean>;
    init(): Promise<void>;
}
//# sourceMappingURL=NextAuthorizationBase.d.ts.map