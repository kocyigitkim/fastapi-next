import { NextContextBase } from "../NextContext";

export interface NextPermission {
    method: string;
    path: string;
    accept: string[];
}