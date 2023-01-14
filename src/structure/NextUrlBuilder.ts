import { NextApplication } from "../NextApplication";

export class NextUrlBuilder{
    constructor(public app: NextApplication){}
    public build(path?: string, args?: {[key: string]: string}): string{
        var url = this.app.options.baseUrl;
        if(path){
            url += path;
        }
        if(args){
            url += "?";
            for(var key in args){
                url += key + "=" + args[key] + "&";
            }
            url = url.substring(0,url.length-1);
        }
        return url;
    }
}