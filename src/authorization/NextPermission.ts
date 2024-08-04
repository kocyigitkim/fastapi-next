import { NextContextBase } from "../NextContext";

export interface NextPermissionDefinition {
    anonymous?: boolean;
    path?: string;
    custom?: Function;
}