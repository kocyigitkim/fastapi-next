import {  ObjectSchema } from 'yup';
import { AnyObjectSchema } from 'yup';
import { ApiResponse, NextRouteResponse } from '..'
import { NextPermissionDefinition } from '../authorization/NextPermission'
import { NextContextBase } from '../NextContext'
import { ValidationResult } from '../validation/ValidationResult'

export interface NextRouteAction {
    default(ctx: NextContextBase): Promise<ApiResponse<any> | NextRouteResponse | any> | (ApiResponse<any> | NextRouteResponse);
    validate: ((ctx: NextContextBase) => ValidationResult) | AnyObjectSchema | ObjectSchema<any> | null;
    permission: NextPermissionDefinition | undefined;
    description?: string;
    summary?: string;
    tags?: string[];
    deprecated?: boolean;
    middlewares?: {
        beforeExecution?: Function[],
        afterValidation?: Function[],
        afterExecution?: Function[],
    };
}