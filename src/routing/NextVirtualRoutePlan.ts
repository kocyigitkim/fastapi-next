import { NextApplication } from "..";

export class NextVirtualRoutePlan{
    private static routes = [];
    public static register(subPath: string, definition: any){
        NextVirtualRoutePlan.routes.push({
            path: subPath,
            definition: definition
        });
    }
    public build(app: NextApplication){
        
    }

}