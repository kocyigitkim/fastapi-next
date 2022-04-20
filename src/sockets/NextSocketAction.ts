import { NextContextBase } from "../NextContext";
import { NextSocketContext } from "./NextSocketContext";

export type NextSocketAction = (ctx: NextContextBase, sctx: NextSocketContext) => Promise<void>;
