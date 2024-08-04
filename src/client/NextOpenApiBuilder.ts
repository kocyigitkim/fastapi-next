import { NextApplication } from "../NextApplication";
import swaggerUI from 'swagger-ui-express'
import { GenerateOpenApiDocument } from "./openapi/GenerateOpenApiDocument";
import { SwaggerOneDarkTheme } from "./swagger/OneDarkTheme";
export class NextOpenApiBuilder {
    constructor(public app: NextApplication) { }
    public use() {
        const options = this.app.options.openApi;
        const baseUrl = this.app.options.baseUrl || (
            `http://localhost:${this.app.options.port}`
        );
        var httpUrl: any = new URL(baseUrl);
        httpUrl.protocol = "http";
        var httpsUrl: any = new URL(baseUrl);
        httpsUrl.protocol = "https";
        httpUrl = httpUrl.toString();
        httpsUrl = httpsUrl.toString();
        if (httpUrl.endsWith("/")) httpUrl = httpUrl.substr(0, httpUrl.length - 1);
        if (httpsUrl.endsWith("/")) httpsUrl = httpsUrl.substr(0, httpsUrl.length - 1);

        var openApiDocument = GenerateOpenApiDocument(this.app, options, httpUrl, httpsUrl)

        var openApi = this.app.options.openApi;
        if (openApi) {
            this.app.express.get(openApi.path, (req, res) => {
                res.status(200).header('content-type', 'application/json').send(JSON.stringify(openApiDocument, null, 2));
            });
        }

        var swagger = this.app.options.swagger;
        if (swagger?.enabled) {
            this.app.express.use(swagger.path, swaggerUI.serve, swaggerUI.setup(null, {
                explorer: true,
                isExplorer: true,
                customCss: (swagger.customCss|| "") + SwaggerOneDarkTheme,
                customSiteTitle: swagger.customSiteTitle || openApi.title,
                customfavIcon: swagger.customFavicon,
                customJs: swagger.customScript,
                swaggerUrl: (openApi.https ? httpsUrl : httpUrl) + openApi.path,
                swaggerOptions: {
                    urls: [
                        ...(openApi.https ? [{
                            name: "HTTPS",
                            url: httpsUrl + openApi.path
                        }] : []),
                        ...(openApi.http ? [{
                            name: "HTTP",
                            url: httpUrl + openApi.path
                        }] : [])
                    ]
                }
            }));
            console.log("You can access to swagger ui at " + (openApi.https ? httpsUrl : httpUrl) + swagger.path);
        }
    }


}


