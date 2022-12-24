import { NextApplication } from "../NextApplication";
import { YupSchemaParsed } from "../reflection/YupVisitor";

export class NextClientBuilder {
    constructor(public app: NextApplication) {
    }
    private buildRouters() {
        var routers = [];
        var authLoginPaths = [];
        if (this.app.options.authentication && Array.isArray(this.app.options.authentication.Methods)) {
            for (var authMethod of this.app.options.authentication.Methods) {
                authLoginPaths.push(authMethod.basePath + authMethod.loginPath);
            }
        }
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
    public buildTypes() {
        var types = [];
        for (const router of this.app.routeBuilder.registeredRoutes) {
            if (!router.path.endsWith("/")) {
                var pathParts = router.path.split("/");
                for (var i = 2; i < pathParts.length; i++) {
                    pathParts[i] = pathParts[i].charAt(0).toUpperCase() + pathParts[i].slice(1);
                }
                var typeDefinition = "any";
                if (router.requestSchema) {
                    typeDefinition = buildSchema(router.requestSchema);
                }
                types.push(`    ${pathParts.join("")}: (args: ${typeDefinition}, options?: { errorCallback?: (e: any) => void }) => Promise<ApiResponse>;`);
            }
        }
        return types.join("\r");
    }
    public build() {
        console.log("Registering client endpoint")
        this.app.express.get("/fastapi/types", async (req, res, next) => {
            var types = this.buildTypes();
            // define window.fastapi object type
            res.status(200).header("Content-Type", "text/javascript").send(`
interface ApiResponse<T=any>{
    data?: T;
    message?: string;
    success: boolean;
}
interface FastApiClient {
    init: (url) => void;
    ${types}
}
declare var fastapi: FastApiClient;
`);
        });

        this.app.express.get("/fastapi/client", async (req, res, next) => {
            const isSocketEnabled = Boolean(this.app.options.sockets);
            var routers = this.buildRouters();


            res.status(200).header("Content-Type", "text/javascript").send(`
function FastApiRouter(path,method){
    return async (args, options)=>{
        var localData = {};
        try{
            localData = JSON.parse(localStorage.getItem("fapi") || "{}");
        } catch(e){
            console.error(e);
        }
        return fetch(window.fastapi_client + path, {
            ...options,
            method: method,
            body: JSON.stringify(args),
            headers: {
                "Content-Type": "application/json",
                ...localData,
            }
        }).then(res=>{
            //check the response content type
            var localDataIsChanged = false;
            if(res.headers.get("sessionid")){
                localData.sessionid = res.headers.get("sessionid");
                localDataIsChanged = true;
            }
            if(localDataIsChanged) localStorage.setItem("fapi", JSON.stringify(localData));
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
        global.fastapi = window.fastapi;
    }
}
global.fastapi = window.fastapi;
            `);
        });


        console.log("You can access the client endpoint at /fastapi/client");
        console.log("You can access typescript definitions at /fastapi/client/types");
    }
}

function buildSchema(requestSchema: YupSchemaParsed): string {
    var typeDefinition = "any";
    if (requestSchema.type === "object") {
        var properties = [];
        for (const key in requestSchema.properties) {
            if (Object.prototype.hasOwnProperty.call(requestSchema.properties, key)) {
                const element = requestSchema.properties[key];
                const nullable = (element.nullable || !element.required) ? '?' : '';
                properties.push(`${key}${nullable}: ${buildSchema(element)}`);
            }
        }
        typeDefinition = `{
            ${properties.join(",")}
        }`;
    } else if (requestSchema.type === "array") {
        typeDefinition = `${buildSchema(requestSchema.elementType)}[]`;
    } else if (requestSchema.type === "string") {
        typeDefinition = "string";
    } else if (requestSchema.type === "number") {
        typeDefinition = "number";
    } else if (requestSchema.type === "boolean") {
        typeDefinition = "boolean";
    }
    return typeDefinition;
}
