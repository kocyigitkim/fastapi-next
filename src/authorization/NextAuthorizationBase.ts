import { NextContextBase } from "..";
import { NextPermissionDefinition } from "./NextPermission";

export class NextAuthorizationBase{
    public async check(ctx: NextContextBase, permission: NextPermissionDefinition) : Promise<boolean>{
        return true;
    }
    public async init(){
    }
}
