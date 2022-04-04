import { NextFSObject } from './NextFSObject';
import { NextFSType } from "./NextFSType";


export class NextFSDirectory extends NextFSObject {
    public type = NextFSType.Directory;
}
