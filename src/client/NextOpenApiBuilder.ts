import { NextOpenApiOptions } from "../config/NextOptions";
import { NextApplication } from "../NextApplication";
import { YupSchemaParsed } from "../reflection/YupVisitor";
import { NextRouteDefinition } from "../routing/NextRouteBuilder";

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

        var openApiDocument = {
            "openapi": "3.0.0",
            "info": {
                "title": options.title || "Fast Api Next",
                "version": options.version || "1.0.0"
            },
            "paths": {
                ...((() => {
                    var paths = {};

                    for (const router of this.app.routeBuilder.registeredRoutes) {
                        if (!router.path.endsWith("/")) {
                            var pathParts = router.path.split("/");
                            for (var i = 2; i < pathParts.length; i++) {
                                pathParts[i] = pathParts[i].charAt(0).toUpperCase() + pathParts[i].slice(1);
                            }
                            var path = pathParts.join("/");
                            paths[path] = {
                                [router.method.toLowerCase()]: {
                                    "summary": router.description,
                                    "tags": [router.method],
                                    ...(
                                        ["get", "head"].includes(router.method.toLowerCase()) ? (
                                            {
                                                parameters: BuildOpenApiFunctionSchema(this.app, options, router)
                                            }
                                        ) : ({
                                            "requestBody": {
                                                "content": {
                                                    "application/json": {
                                                        "schema": BuildOpenApiFunctionSchema(this.app, options, router)
                                                    }
                                                }
                                            }
                                        })
                                    ),
                                    "responses": {}
                                }
                            }
                        }
                    }

                    return paths;
                })())
            },
            "components": {
                "schemas": {
                },
                "securitySchemes": {

                },
                "responses": {

                },
                "parameters": {
                },
                "requestBodies": {},
                "headers": {
                }
            },
            "security": [
            ]
            ,
            "tags": [
            ]
            ,
            "servers": [
                ...(options.http ? [
                    {
                        "url": httpUrl,
                        "description": "HTTP"
                    }
                ] : []),
                ...(options.https ? [
                    {
                        "url": httpsUrl,
                        "description": "HTTPS"
                    }
                ] : [])
            ],
            "externalDocs": {
                "description": "Find out more about Fast Api Next",
                "url": "https://docs.kocyigit.kim/tr/fastapi/readme"
            },
        }


        var openApi = this.app.options.openApi;
        if (openApi) {
            this.app.express.get(openApi.path, (req, res) => {
                res.status(200).header('content-type', 'application/json').send(JSON.stringify(openApiDocument, null, 2));
            });
        }
    }
}

function BuildOpenApiFunctionSchema(app: any, options: NextOpenApiOptions, router: NextRouteDefinition) {
    const schema = router.requestSchema;

    const convertYupToOpenApiSchema = (schema: YupSchemaParsed) => {
        if (!schema) return {
            type: "object"
        };

        switch (schema.type) {
            case "object":
                return {
                    type: "object",
                    properties: Object.fromEntries(Object.entries(schema.properties).map(([key, value]) => [key, convertYupToOpenApiSchema(value)]))
                }
                break;
            case "array":
                return {
                    type: "array",
                    items: convertYupToOpenApiSchema(schema.elementType)
                };
                break;
            case "string":
                return {
                    type: "string"
                };
                break;
            case "number":
                return {
                    type: "number"
                };
                break;
            case "boolean":
                return {
                    type: "boolean"
                };
                break;
        }
        return null;
    };
    return convertYupToOpenApiSchema(schema);
}
