import { NextContextBase } from "..";

export class NextAuthorizationBase{
    public async check(ctx: NextContextBase) : Promise<boolean>{
        return true;
    }
    public async init(){
    }
}
