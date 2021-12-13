import { NextSessionManager } from "../NextSessionManager";

export class NextOptions{
    public debug: boolean = false;
    public port: number = 5000;
    public session: NextSessionManager = new NextSessionManager();
    public routerDirs: string[] = [];
}