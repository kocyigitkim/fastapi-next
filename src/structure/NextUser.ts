import { NextRole } from "./NextRole";

export class NextUser {
    public id: string;
    public name: string;
    public surname?: string;
    public email?: string;
    public userName?: string;
    public phone?: string;
    public additionalInfo?: any;
    public roles?: NextRole[];
}
