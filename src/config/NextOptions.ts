import { CorsOptions } from "cors";


export class NextOptions {
    public debug: boolean = false;
    public port: number = 5000;
    public routerDirs: string[] = [];
    public cors: CorsOptions = null;
}