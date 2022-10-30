import { NextApplication } from "../NextApplication";

export class NextClientBuilder {
    constructor(public app: NextApplication) {
    }
    private buildRouters() {
        var routers = [];
        for (const router of this.app.routeBuilder.registeredRoutes) {
            if (!router.path.endsWith("/")) {
                var pathParts = router.path.split("/");
                for (var i = 2; i < pathParts.length; i++) {
                    pathParts[i] = pathParts[i].charAt(0).toUpperCase() + pathParts[i].slice(1);
                }
                routers.push(`    this.${pathParts.join("")} = FastApiRouter("${router.path}", "${router.method}");`);
            }
        }
        return routers.join("\r");
    }
    public build() {
        console.log("Registering client endpoint")
        this.app.express.use("/fastapi/client", async (req, res, next) => {
            const isSocketEnabled = Boolean(this.app.options.sockets);
            var routers = this.buildRouters();


            res.status(200).header("Content-Type", "text/javascript").send(`
function FastApiRouter(path,method){
    return async (args, options)=>{
        return fetch(window.fastapi_client + path, {
            ...options,
            method: method,
            body: JSON.stringify(args),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res=>{
            //check the response content type
            if(res.headers.get("Content-Type")?.startsWith("application/json")){
                return res.json();
            }else{
                return res.text();
            }
        }).catch(((options && options.errorCallback) ? options.errorCallback : console.error));
    };
}
function FastApiClient(apiUrl){
    if(apiUrl.endsWith("/")){
        apiUrl = apiUrl.substring(0, apiUrl.length - 1);
    }
    window.fastapi_client = apiUrl;
    this.socket = ${isSocketEnabled ? "new WebSocket('ws://'+apiUrl+'/" + (this.app.options.sockets.path || "") + "');" : "null;"};
${routers}
}

window.fastapi = {
    init: (...args)=>{
        window.fastapi = new FastApiClient(...args);
    }
}
            `);
        });
        console.log("You can access the client endpoint at /fastapi/client");
    }
}