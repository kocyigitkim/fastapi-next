import fs from 'fs';
import path from 'path';
import { NextApplication } from '../NextApplication';
import { NextPlugin } from '../plugins/NextPlugin';

export interface DbMiddlewareAutoLoadOptions {
  dirs: string[];
  pluginName?: string; // default 'db'
  enabled?: boolean;
}

export class DbMiddlewareLoader {
  constructor(private app: NextApplication, private options: DbMiddlewareAutoLoadOptions) {}

  async load() {
    if(!this.options?.enabled) return;
    const pluginName = this.options.pluginName || 'db';
    const plugin: NextPlugin<any> = this.app.registry.getPlugin(pluginName) as any;
    if(!plugin) {
      this.app.log.warn(`DbMiddlewareLoader: plugin '${pluginName}' not found`);
      return;
    }
    for(const dir of this.options.dirs) {
      const abs = path.isAbsolute(dir)?dir:path.join(process.cwd(), dir);
      if(!fs.existsSync(abs)) continue;
      const files = fs.readdirSync(abs).filter(f=>/\.(js|ts)$/.test(f) && !f.endsWith('.d.ts'));
      for(const file of files) {
        const full = path.join(abs,file);
        try {
          const exp = require(full);
          const middlewares = Array.isArray(exp) ? exp : (exp.middlewares || exp.default || exp.middleware || []);
          const list = Array.isArray(middlewares) ? middlewares : [middlewares];
          list.filter(Boolean).forEach(mw=>{
            if(typeof mw === 'function') {
              // function receives plugin to register custom logic
              mw(plugin);
            } else if(typeof mw === 'object') {
              plugin.registerDbMiddleware(mw);
            }
          });
          this.app.log.info(`Loaded ${list.length} db middleware(s) from ${file}`);
        } catch (e:any) {
          this.app.log.error(`DbMiddlewareLoader error in ${file}: ${e.message}`);
        }
      }
    }
  }
}
