import { AnySchema } from "yup";

export interface YupSchemaParsed {
    type: string;
    properties?: {
        [key: string]: YupSchemaParsed;
    };
    elementType?: YupSchemaParsed;
    nullable?: boolean;
    required?: boolean;
    strip?: boolean;
    strict?: boolean;
    abortEarly?: boolean;
    recursive?: boolean;
    matches?: {
        message: string;
        name: string;
        params: {
            regex: RegExp;
        }
    }
    raw?: AnySchema
}

export class YupVisitor {
    private static convertYupTypeToOpenApiType(yupType) {
        switch (yupType) {
            case 'string':
                return 'string';
            case 'number':
                return 'number';
            case 'boolean':
                return 'boolean';
            case 'date':
                return 'string';
            default:
                return 'string';
        }
    }

    public static parseYupSchema(yupObj): YupSchemaParsed {
        var result: YupSchemaParsed;
        switch (yupObj.type) {
            case 'object':
                {
                    var properties = {};
                    for (var key in yupObj.fields) {
                        properties[key] = YupVisitor.parseYupSchema(yupObj.fields[key]);
                    }
                    result = {
                        type: 'object',
                        properties: properties,
                    };
                }
                break;
            case 'array':
                {
                    result = {
                        type: 'array',
                        elementType: YupVisitor.parseYupSchema(yupObj.innerType),
                    };
                }
                break;
            case 'string':
            case 'number':
            case 'boolean':
                {
                    result = {
                        type: YupVisitor.convertYupTypeToOpenApiType(yupObj.type),
                    };
                }
                break;
            case 'date':
                {
                    result = {
                        type: YupVisitor.convertYupTypeToOpenApiType(yupObj.type),
                    };
                }
            default:
                result = {
                    type: 'string',
                };
        }
        result.abortEarly = yupObj.spec.abortEarly;
        result.nullable = yupObj.spec.nullable;
        result.required = yupObj.spec.presence === 'required';
        result.strip = yupObj.spec.strip;
        result.strict = yupObj.spec.strict;
        result.recursive = yupObj.spec.recursive;
        result.matches = yupObj.tests?.find(x => x.OPTIONS.name === 'matches' || x.OPTIONS.name == 'email')?.OPTIONS;
        result.raw = yupObj;
        return result;
    }
}