import { ApiResponse, NextRouteResponse } from '..';
import { NextPermission } from '../authorization/NextPermission';
import { NextContextBase } from '../NextContext';
import { ValidationResult } from '../validation/ValidationResult';
export interface NextRouteAction {
    default(ctx: NextContextBase): Promise<ApiResponse<any> | NextRouteResponse | any>;
    validate(ctx: NextContextBase): ValidationResult;
    permission: NextPermission | undefined;
}
//# sourceMappingURL=NextRouteAction.d.ts.map