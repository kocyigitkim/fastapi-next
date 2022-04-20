import { NextContext } from "../NextContext";

export class NextCacheDefinition {
    public expire: number = 300;
    public isDynamic: boolean = false;
    public can: (req: NextContext<any>) => Promise<boolean> = () => new Promise(resolve => resolve(true));

    constructor(expire: number, isDynamic: boolean = false, can: (req: NextContext<any>) => Promise<boolean>) {
        this.expire = expire;
        this.isDynamic = isDynamic;
        this.can = can;
    }
}

class NextCacheItem {
    constructor(public expire: number, public data: any) { }
}

class NextCacheOptions {
    public markAndSweepInterval: number;
}

export class NextCache {
    private cache: Map<string, NextCacheItem> = new Map<string, NextCacheItem>();
    private timer: NodeJS.Timer;
    constructor(public options: NextCacheOptions) {
        if (!options.markAndSweepInterval) options.markAndSweepInterval = 30000;
        this.markandsweep = this.markandsweep.bind(this);
        this.timer = setInterval(this.markandsweep, options.markAndSweepInterval);
    }
    async markandsweep() {
        var now = new Date().getTime();
        var keys = Array.from(this.cache.keys());
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var item = this.cache.get(key);
            if (item.expire > 0 && item.expire < now) {
                this.cache.delete(key);
            }
        }
    }
}