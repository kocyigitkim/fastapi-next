import { NextRole } from "./NextRole";


export class NextToken {
    public id: string;
    public userId?: string;
    public token: string;
    public expires: Date;
    public additionalInfo?: any;
    public roles?: NextRole[];
}
