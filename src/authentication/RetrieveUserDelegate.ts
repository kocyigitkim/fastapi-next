import { NextContextBase } from "../NextContext";
import { NextUser } from "../structure/NextUser";

export type RetrieveUserDelegate = (ctx: NextContextBase, username: string, password: string) => Promise<NextUser>;
