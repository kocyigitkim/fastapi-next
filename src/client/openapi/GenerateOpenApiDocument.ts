import { NextApplication } from "../../NextApplication";
import { BuildOpenApiFunctionSchema } from "./BuildOpenApiFunctionSchema";
import { NextOpenApiOptions } from "../../config/NextOptions";

export function GenerateOpenApiDocument(app: NextApplication, options: NextOpenApiOptions, httpUrl: any, httpsUrl: any) {
    return {
        "openapi": "3.0.0",
        "info": {
            "title": options.title || "Fast Api Next",
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
                        paths[path] = {
                            [router.method.toLowerCase()]: {
                                "summary": router.action.summary || router.action.description,
                                "description": router.action.description || router.action.summary,
                                "deprecated": router.action.deprecated || false,
                                "tags": [router.method, ...(router.action.tags || [])],
                                ...(
                                    ["get", "head"].includes(router.method.toLowerCase()) ? (
                                        {
                                            parameters: BuildOpenApiFunctionSchema(app, options, router)
                                        }
                                    ) : ({
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
                                        }
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
            "securitySchemes": {
                ...(app.jwtController && {
                    "bearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                })
            },
            "responses": {},
            "parameters": {},
            "requestBodies": {},
            "headers": {}
        },
        "security": [
            {
                ...(app.jwtController && {
                    "bearerAuth": [{
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }]
                })
            }
        ],

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
