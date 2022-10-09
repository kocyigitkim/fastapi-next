import { NextApplication } from "..";
import { ReactServerIndex } from "./ReactServerIndex";

export enum NextRendererType {
    Express = "express",
    React = "react"
}

export class NextRenderingContext {
    public renderer: NextRendererType;
    public entryPoint: any;
    public title?: string;
    public tags?: {
        name: string,
        props?: any;
        children?: any;
    }[];
    public use(app: NextApplication) {
        if (this.renderer == NextRendererType.React) {

            const reactDomServer = require('react-dom/server');

            app.express.get("*", (req, res, next) => {
                var rendered = reactDomServer.renderToString(this.entryPoint);
                res.send(ReactServerIndex({
                    body: rendered,
                    staticDir: app.options.staticDir,
                    tags: this.tags,
                    title: this.title
                }));
            });
        }
    }
}