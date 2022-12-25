import { randomUUID } from "crypto";
import { NextSocketDataType } from "./NextSocketDataType";
import { NextSocketMessageType } from "./NextSocketMessageType";

export class NextSocketMessageBase {
    public id: string = randomUUID();
    public type: NextSocketMessageType;
    public path: string;
    public body?: any;
    public dataType?: NextSocketDataType;
}

