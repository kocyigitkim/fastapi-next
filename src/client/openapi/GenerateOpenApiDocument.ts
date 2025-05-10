import { NextApplication } from "../../NextApplication";
import { BuildOpenApiFunctionSchema } from "./BuildOpenApiFunctionSchema";
import { NextOpenApiOptions } from "../../config/NextOptions";
import { NextBasicAuthenticationMethod } from "../../authentication/methods/NextBasicAuthenticationMethod";
import path from 'path';
import { urlPathJoin } from "../../utils";

/**
 * Generates the OpenAPI document for the application
 * @param app The Next application
 * @param options OpenAPI options
 * @param httpUrl HTTP base URL
 * @param httpsUrl HTTPS base URL
 * @returns Complete OpenAPI document
 */
export function GenerateOpenApiDocument(app: NextApplication, options: NextOpenApiOptions, httpUrl: any, httpsUrl: any) {
    let security: any = [];
    let securitySchemes: any = {};
    
    // Setup authentication schemes
    if (app.jwtController) {
        securitySchemes.bearerAuth = {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
        };
        security.push({
            bearerAuth: []
        });
    }
    
    // Setup basic auth if available
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

    // Extract tags from routes
    const allTags = new Set<string>();
    app.routeBuilder.registeredRoutes.forEach(router => {
        if (router.action.tags && router.action.tags.length) {
            router.action.tags.forEach(tag => allTags.add(tag));
        } else {
            // Extract tag from path
            const pathParts = router.path.split("/").filter(p => p && !p.startsWith(":"));
            if (pathParts.length > 0) {
                allTags.add(pathParts[0]);
            }
        }
    });

    // Create tag objects with descriptions
    const tagObjects = Array.from(allTags).map(tagName => {
        // Find a predefined tag with this name
        const predefinedTag = options.tags?.find(t => t.name === tagName);
        return {
            name: tagName,
            description: predefinedTag?.description || `Operations related to ${tagName}`
        };
    });

    // Generate common response components
    const responseComponents = {
        'SuccessResponse': {
            description: 'Successful operation response',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: {
                                type: 'boolean',
                                example: true
                            },
                            message: {
                                type: 'string',
                                example: 'Operation successful'
                            },
                            data: {
                                type: 'object'
                            }
                        }
                    }
                }
            }
        },
        'ErrorResponse': {
            description: 'Error response',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: {
                                type: 'boolean',
                                example: false
                            },
                            message: {
                                type: 'string',
                                example: 'Error message'
                            },
                            errors: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        field: {
                                            type: 'string',
                                            description: 'Field with error'
                                        },
                                        message: {
                                            type: 'string',
                                            description: 'Error message'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        'UnauthorizedResponse': {
            description: 'Unauthorized access',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            success: {
                                type: 'boolean',
                                example: false
                            },
                            message: {
                                type: 'string',
                                example: 'Unauthorized'
                            }
                        }
                    }
                }
            }
        }
    };

    // Build OpenAPI document
    const openApiDoc = {
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
                
                // Sort routes if configured
                const routes = options.sortEndpoints 
                    ? [...app.routeBuilder.registeredRoutes].sort((a, b) => a.path.localeCompare(b.path))
                    : app.routeBuilder.registeredRoutes;

                for (const router of routes) {
                    if (!router.path.endsWith("/")) {
                        var pathParts = router.path.split("/");
                        for (var i = 2; i < pathParts.length; i++) {
                            pathParts[i] = pathParts[i].charAt(0).toUpperCase() + pathParts[i].slice(1);
                        }
                        var path = pathParts.join("/");
                        var isBasicLoginPath = basicMethodPath === router.path;
                        
                        // Extract path parameters
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
                                    name: paramName,
                                    required: true,
                                    schema: {
                                        type: "string"
                                    },
                                    description: `Path parameter: ${paramName}`
                                };
                            });
                        }
                        
                        // Handle authentication requirements
                        let methodSecurity: any = undefined;
                        if (
                            router.action.permission?.anonymous !== true &&
                            router.action.permission?.custom === undefined
                        ) {
                            methodSecurity = security;
                        }
                        
                        // Generate tags for this endpoint
                        let routeTags = router.action.tags || [];
                        if (routeTags.length === 0 && options.organizeByTags) {
                            // Generate tag from path if none provided
                            const firstPathPart = router.path.split("/").filter(Boolean)[0];
                            if (firstPathPart) {
                                routeTags.push(firstPathPart);
                            }
                        }
                        
                        // Add operation to paths
                        paths[openApiMethodPath] = {
                            ...(paths[openApiMethodPath] || {}),
                            [router.method.toLowerCase()]: {
                                "security": methodSecurity,
                                "summary": router.action.summary || router.action.description,
                                "description": router.action.description || router.action.summary,
                                "deprecated": router.action.deprecated || false,
                                "tags": routeTags.length > 0 ? routeTags : [router.method],
                                "operationId": `${router.method.toLowerCase()}${pathParts.slice(1).join("")}`,
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
                                            "required": true,
                                            "description": "Request payload",
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
                                    "400": {
                                        "description": "Bad Request",
                                        "$ref": "#/components/responses/ErrorResponse"
                                    },
                                    "401": {
                                        "description": "Unauthorized",
                                        "$ref": "#/components/responses/UnauthorizedResponse"
                                    },
                                    "403": {
                                        "description": "Forbidden",
                                        "$ref": "#/components/responses/UnauthorizedResponse"
                                    },
                                    "500": {
                                        "description": "Internal Server Error",
                                        "$ref": "#/components/responses/ErrorResponse"
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
            "responses": responseComponents,
            "parameters": {},
            "requestBodies": {},
            "headers": {}
        },
        "security": security,
        "tags": tagObjects,

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
            ] : []),
            ...(options.additionalServers || [])
        ],
        "externalDocs": options.externalDocs || {
            "description": "Find out more about Fast Api Next",
            "url": "https://docs.kocyigit.kim/tr/fastapi/readme"
        },
    };
    
    return openApiDoc;
}
