import { NextContextBase } from "../NextContext";

export interface NextPermission {
    anonymous: boolean;
    path: string;
    custom: Function;
}