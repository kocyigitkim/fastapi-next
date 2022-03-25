import { randomUUID } from "crypto";
import { NextSocketMessageType } from "./NextSocketMessageType";

export class NextSocketMessageBase {
    public id: string = randomUUID();
    public type: NextSocketMessageType;
    public path: string;
    public body?: any;
}
