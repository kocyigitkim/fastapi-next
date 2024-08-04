import { NextFlag } from "../../NextFlag";
import { ValidationResult } from "../../validation/ValidationResult";
import { CurrentArgsSource, WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";
import { ObjectSchema, ValidationError } from 'yup';

export class ValidateAction extends WorkflowRouteAction {
    constructor(private schema: ObjectSchema<any>) {
        super("validate");
        this.definitionOnly = true;
    }

    public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
        let result = new WorkflowRouteActionResult().setError(
            "Execution error",
            500
        );

        var validateSchema = this.schema;
        var isError = false;
        let all = context.getCurrentArgs(CurrentArgsSource.all);
        var schemaResult = await validateSchema.validate(all).catch((err) => {
            isError = true;
            return err;
        });
        if (isError) {
            var yupResult = new ValidationResult();
            var yupError: ValidationError = schemaResult as ValidationError;
            yupResult.error(yupError.path, yupError.message);

            return result.setError(
                yupError as any, 400
            ).setFlag(NextFlag.Exit);
        }

        return result.setSuccess(schemaResult);
    }
}
