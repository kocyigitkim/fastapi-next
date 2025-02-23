import { NextApplication } from "../../NextApplication";
import { BuildOpenApiFunctionSchema } from "./BuildOpenApiFunctionSchema";
import { NextOpenApiOptions } from "../../config/NextOptions";
import { NextBasicAuthenticationMethod } from "../../authentication/methods/NextBasicAuthenticationMethod";
import path from 'path';
import { urlPathJoin } from "../../utils";

export function GenerateOpenApiDocument(app: NextApplication, options: NextOpenApiOptions, httpUrl: any, httpsUrl: any) {
    let security: any = [];
    let securitySchemes: any = {};

    if (app.jwtController) {
        securitySchemes.bearerAuth = {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
        };
        security.push({
            bearerAuth: [
                {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            ]
        });
    }
    let basicMethodPath = undefined;
    if (app.options.authentication && app.options.authentication.Methods) {
        for (var authMethod of app.options.authentication.Methods) {
            if (authMethod instanceof NextBasicAuthenticationMethod) {
                basicMethodPath = urlPathJoin(authMethod.basePath, authMethod.loginPath);
                // basic authentication uses header parameter for authorization its named as sessionid
                securitySchemes["apiKeyAuth"] = {
                    type: "apiKey",
                    in: "header",
                    name: "sessionid"
                };
                security.push({
                    "apiKeyAuth": []
                });
            }
        }
    }

    return {
        "openapi": "3.0.0",
        "info": {
            "title": options.title || "Fast Api Next",
            "description": options.description || "Fast Api Next Open Api Document",
            "termsOfService": options.termsOfService || "https://docs.kocyigit.kim/tr/fastapi/readme",
            "contact": ((
                options.contactEmail || options.contactName || options.contactUrl
            ) && {
                "name": options.contactName,
                "url": options.contactUrl,
                "email": options.contactEmail,
            }),
            "license": ((
                options.licenseName || options.licenseUrl
            ) && {
                "name": options.licenseName || "MIT",
                "url": options.licenseUrl || "https://opensource.org/licenses/MIT"
            }),
            "version": options.version || "1.0.0"
        },
        "paths": {
            ...((() => {
                var paths = {};

                for (const router of app.routeBuilder.registeredRoutes) {
                    if (!router.path.endsWith("/")) {
                        var pathParts = router.path.split("/");
                        for (var i = 2; i < pathParts.length; i++) {
                            pathParts[i] = pathParts[i].charAt(0).toUpperCase() + pathParts[i].slice(1);
                        }
                        var path = pathParts.join("/");
                        var isBasicLoginPath = basicMethodPath === router.path;
                        let parameters = BuildOpenApiFunctionSchema(app, options, router);
                        let pathParameters: any[] = pathParts.filter(p => p.startsWith(":")).map(p => p.substring(1));
                        let openApiMethodPath = pathParts.map(p => {
                            if (p.startsWith(":")) {
                                return `{${p.substring(1)}}`;
                            }
                            return p;
                        }).join("/");

                        if (Array.isArray(pathParameters) && pathParameters.length > 0) {
                            pathParameters = pathParameters.map(paramName => {
                                return {
                                    in: 'path',
                                    name: paramName
                                };
                            });
                        }
                        let methodSecurity: any = undefined;
                        if (
                            router.action.permission?.anonymous !== true &&
                            router.action.permission?.custom === undefined
                        ) {
                            methodSecurity = security;
                        }

                        paths[openApiMethodPath] = {
                            [router.method.toLowerCase()]: {
                                "security": methodSecurity,
                                "summary": router.action.summary || router.action.description,
                                "description": router.action.description || router.action.summary,
                                "deprecated": router.action.deprecated || false,
                                "tags": [router.method, ...(router.action.tags || [])],
                                ...(
                                    ["get", "head"].includes(router.method.toLowerCase()) ? (
                                        {
                                            parameters: [
                                                ...pathParameters
                                            ],
                                        }
                                    ) : ({
                                        parameters: [
                                            ...pathParameters
                                        ],
                                        "requestBody": {
                                            "content": {
                                                "application/json": {
                                                    "schema": BuildOpenApiFunctionSchema(app, options, router)
                                                }
                                            }
                                        }
                                    })
                                ),
                                "responses": {
                                    "200": {
                                        "description": "Success",
                                        "content": {
                                            "application/json": {
                                                "schema": {
                                                    "type": "object",
                                                    "properties": {
                                                        "data": {
                                                            "type": "object",
                                                        },
                                                        "message": {
                                                            "type": "string"
                                                        },
                                                        "success": {
                                                            "type": "boolean"
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        ...(isBasicLoginPath && {
                                            "headers": {
                                                "sessionid": {
                                                    "description": "Session Id",
                                                    "schema": {
                                                        "type": "string"
                                                    }
                                                }
                                            }
                                        })
                                    },
                                    "401": {
                                        "description": "Unauthorized",
                                    },
                                    "500": {
                                        "description": "Internal Server Error"
                                    }
                                }
                            }
                        };
                    }
                }

                return paths;
            })())
        },
        "components": {
            "schemas": {},
            "securitySchemes": securitySchemes,
            "responses": {},
            "parameters": {},
            "requestBodies": {},
            "headers": {}
        },
        "security": security,
        "tags": [],

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
    };
}
