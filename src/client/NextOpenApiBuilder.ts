import { NextApplication } from "../NextApplication";
import swaggerUI from 'swagger-ui-express'
import { GenerateOpenApiDocument } from "./openapi/GenerateOpenApiDocument";
import { SwaggerOneDarkTheme } from "./swagger/OneDarkTheme";

/**
 * Builder for OpenAPI documentation and Swagger UI
 */
export class NextOpenApiBuilder {
    /**
     * Creates a new OpenAPI builder
     * @param app The Next application
     */
    constructor(public app: NextApplication) { }
    
    /**
     * Configure and use OpenAPI and Swagger UI
     */
    public use() {
        const options = this.app.options.openApi;
        const swagger = this.app.options.swagger;
        
        if (!options?.enabled) {
            return;
        }
        
        // Configure base URL
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

        // Generate OpenAPI document
        var openApiDocument = GenerateOpenApiDocument(this.app, options, httpUrl, httpsUrl);

        // Serve OpenAPI JSON document
        if (options) {
            this.app.express.get(options.path, (req, res) => {
                res.status(200)
                   .header('content-type', 'application/json')
                   .header('Access-Control-Allow-Origin', '*')
                   .send(JSON.stringify(openApiDocument, null, 2));
            });
        }

        // Setup Swagger UI
        if (swagger?.enabled) {
            // Base swagger options
            const swaggerOptions: any = {
                explorer: true,
                isExplorer: true,
                customCss: (swagger.customCss || "") + (swagger.darkMode !== false ? SwaggerOneDarkTheme : ""),
                customSiteTitle: swagger.customSiteTitle || options.title,
                customfavIcon: swagger.customFavicon,
                customJs: swagger.customScript,
                customHeadContent: swagger.customHeadContent,
                swaggerUrl: (options.https ? httpsUrl : httpUrl) + options.path,
                swaggerOptions: {
                    urls: [
                        ...(options.https ? [{
                            name: "HTTPS",
                            url: httpsUrl + options.path
                        }] : []),
                        ...(options.http ? [{
                            name: "HTTP",
                            url: httpUrl + options.path
                        }] : [])
                    ],
                    // Apply additional swagger options when available
                    ...(swagger.filter !== undefined && { filter: swagger.filter }),
                    ...(swagger.defaultModelsExpandDepth !== undefined && { defaultModelsExpandDepth: swagger.defaultModelsExpandDepth }),
                    ...(swagger.defaultModelExpandDepth !== undefined && { defaultModelExpandDepth: swagger.defaultModelExpandDepth }),
                    ...(swagger.displayOperationId !== undefined && { displayOperationId: swagger.displayOperationId }),
                    ...(swagger.showExtensions !== undefined && { showExtensions: swagger.showExtensions }),
                    ...(swagger.defaultModelRendering && { defaultModelRendering: swagger.defaultModelRendering }),
                    ...(swagger.syntaxHighlight !== undefined && { syntaxHighlight: swagger.syntaxHighlight }),
                    ...(swagger.showRequestHeaders !== undefined && { showRequestHeaders: swagger.showRequestHeaders }),
                    ...(swagger.showCommonExtensions !== undefined && { showCommonExtensions: swagger.showCommonExtensions }),
                    ...(swagger.docExpansion && { docExpansion: swagger.docExpansion }),
                    ...(swagger.maxDisplayedTags !== undefined && swagger.maxDisplayedTags !== null && { maxDisplayedTags: swagger.maxDisplayedTags }),
                    ...(swagger.displayRequestDuration !== undefined && { displayRequestDuration: swagger.displayRequestDuration }),
                }
            };
            
            // Setup Swagger UI
            this.app.express.use(swagger.path, swaggerUI.serve, swaggerUI.setup(null, swaggerOptions));
            
            // Log access information
            console.log(`OpenAPI documentation available at ${(options.https ? httpsUrl : httpUrl) + options.path}`);
            console.log(`Swagger UI available at ${(options.https ? httpsUrl : httpUrl) + swagger.path}`);
        }
    }
}


