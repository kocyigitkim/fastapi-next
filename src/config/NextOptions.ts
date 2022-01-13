import { CorsOptions } from "cors";
import { NextAuthorizationBase } from "../authorization/NextAuthorizationBase";


export class NextOptions {
    public debug: boolean = false;
    public port: number = 5000;
    public routerDirs: string[] = [];
    public cors: CorsOptions = null;
    public authorization?: NextAuthorizationBase = null;
}