import { NextApplication } from "../NextApplication";
import { NextContext } from "../NextContext";
import { NextPlugin } from "../plugins/NextPlugin";

export class NextCorsPlugin extends NextPlugin {
    constructor() {
        super("cors", false);
    }
    public async init(app: NextApplication) {
        app.log.info("CORS plugin loaded");
    }
    public async middleware(next: NextContext): Promise<boolean> {
        next.res.setHeader("Access-Control-Allow-Origin", "*");
        next.res.setHeader("Access-Control-Allow-Methods", "*");
        next.res.setHeader("Access-Control-Allow-Headers", "*");
        next.res.setHeader("Access-Control-Max-Age", "86400");
        next.res.setHeader("x-frame-options", "SAMEORIGIN");
        next.res.setHeader("X-XSS-Protection", "0");
        if (next.req.method === "OPTIONS") {
            next.res.sendStatus(200);
        } else {
            next.next();
        }
        return false;
    }
    public async destroy(next: NextApplication): Promise<void> {

    }
}