import { NextOpenApiOptions } from "../../config/NextOptions";
import { YupSchemaParsed } from "../../reflection/YupVisitor";
import { NextRouteDefinition } from "../../routing/NextRouteBuilder";

export function BuildOpenApiFunctionSchema(app: any, options: NextOpenApiOptions, router: NextRouteDefinition) {
    const schema = router.requestSchema;

    const convertYupToOpenApiSchema = (schema: YupSchemaParsed) => {
        if (!schema)
            return {
                type: "object"
            };

        switch (schema.type) {
            case "object":
                return {
                    type: "object",
                    properties: Object.fromEntries(Object.entries(schema.properties).map(([key, value]) => [key, convertYupToOpenApiSchema(value)]))
                };
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
        return {
            type: "object"
        };
    };
    return convertYupToOpenApiSchema(schema);
}
