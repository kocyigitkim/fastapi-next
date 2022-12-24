import { NextContextBase } from "../NextContext";
import { NextToken } from "../structure/NextToken";


export type RetrieveTokenDelegate = (ctx: NextContextBase, token: string) => Promise<NextToken>;
