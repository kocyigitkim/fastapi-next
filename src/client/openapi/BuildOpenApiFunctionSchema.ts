import { NextOpenApiOptions } from "../../config/NextOptions";
import { YupSchemaParsed } from "../../reflection/YupVisitor";
import { NextRouteDefinition } from "../../routing/NextRouteBuilder";

/**
 * Builds an OpenAPI schema from a Yup schema for route documentation
 * @param app The Next application
 * @param options OpenAPI options
 * @param router The route definition
 * @returns An OpenAPI schema object
 */
export function BuildOpenApiFunctionSchema(app: any, options: NextOpenApiOptions, router: NextRouteDefinition) {
    const schema = router.requestSchema;

    /**
     * Convert a Yup schema to an OpenAPI schema
     * @param schema The Yup schema to convert
     * @param depth Current depth in nested schema
     */
    const convertYupToOpenApiSchema = (schema: YupSchemaParsed, depth = 0) => {
        if (!schema) {
            return {
                type: "object",
                properties: {}
            };
        }

        // Extract common properties from schema
        const baseSchema: any = {};
        
        if (schema.description) {
            baseSchema.description = schema.description;
        } else if (schema.label) {
            baseSchema.description = schema.label;
        }
        
        if (schema.default !== undefined) {
            baseSchema.default = schema.default;
        }
        
        if (schema.examples && schema.examples.length > 0) {
            baseSchema.example = schema.examples[0];
        }

        switch (schema.type) {
            case "object": {
                const result = {
                    type: "object",
                    ...baseSchema,
                    properties: {}
                };
                
                if (schema.properties) {
                    // Build properties object
                    result.properties = Object.fromEntries(
                        Object.entries(schema.properties).map(([key, value]) => 
                            [key, convertYupToOpenApiSchema(value, depth + 1)]
                        )
                    );
                    
                    // Collect required property names
                    const requiredProps = Object.entries(schema.properties)
                        .filter(([_, value]) => value.required === true)
                        .map(([key, _]) => key);
                    
                    if (requiredProps.length > 0) {
                        result.required = requiredProps;
                    }
                }
                
                return result;
            }
            case "array": {
                return {
                    type: "array",
                    ...baseSchema,
                    items: schema.elementType ? convertYupToOpenApiSchema(schema.elementType, depth + 1) : { type: "string" }
                };
            }
            case "string": {
                const result = {
                    type: "string",
                    ...baseSchema
                };
                
                // Add additional string format validations
                if (schema.format) {
                    result.format = schema.format;
                }
                
                if (schema.enum && schema.enum.length) {
                    result.enum = schema.enum;
                }
                
                if (schema.pattern || (schema.matches && schema.matches.params && schema.matches.params.regex)) {
                    result.pattern = schema.pattern || String(schema.matches.params.regex).slice(1, -1);
                }
                
                if (schema.min !== undefined) {
                    result.minLength = schema.min;
                }
                
                if (schema.max !== undefined) {
                    result.maxLength = schema.max;
                }
                
                return result;
            }
            case "number":
            case "integer": {
                const result = {
                    type: schema.type === "integer" ? "integer" : "number",
                    ...baseSchema
                };
                
                if (schema.min !== undefined) {
                    result.minimum = schema.min;
                }
                
                if (schema.max !== undefined) {
                    result.maximum = schema.max;
                }
                
                if (schema.exclusive && schema.min !== undefined) {
                    result.exclusiveMinimum = true;
                }
                
                if (schema.exclusive && schema.max !== undefined) {
                    result.exclusiveMaximum = true;
                }
                
                return result;
            }
            case "boolean": {
                return {
                    type: "boolean",
                    ...baseSchema
                };
            }
            default: {
                // Fallback for unhandled types
                return {
                    type: "object",
                    ...baseSchema,
                    properties: {}
                };
            }
        }
    };
    
    return convertYupToOpenApiSchema(schema);
}
