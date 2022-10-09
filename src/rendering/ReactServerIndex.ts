export function ReactServerIndex(options: {
    title?: string,
    body?: string,
    tags?: {
        name: string,
        props?: any,
        children?: any[]
    }[],
    staticDir?: string,
}) {

    const renderTag = (tag: any) => {
        if(!tag.props) tag.props = {};
        return `<${tag.name} ${Object.keys(tag.props).map(key => `${key}="${tag.props[key]}"`).join(" ")}>${tag.children ? tag.children.map(renderTag).join("") : ""}</${tag.name}>`;
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <link rel="icon" href="${options.staticDir || ""}/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
        name="description"
        content="Web site created using create-next-app"
        />
        <link rel="apple-touch-icon" href="${options.staticDir || ""}/logo192.png" />
        <!--
            manifest.json provides metadata used when your web app is installed on a
            user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
        -->
        <link rel="manifest" href="${options.staticDir || ""}/manifest.json" />
        <!--
            Notice the use of %PUBLIC_URL% in the tags above.
            It will be replaced with the URL of the \`public\` folder during the build.
            Only files inside the \`public\` folder can be referenced from the HTML.
        -->
        ${options.tags ? options.tags.map(tag => {
        return renderTag(tag);
    }).join("") : ""}
        <title>${options.title || "Fast Api Next"}</title>
    </head>
    <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root">${options.body}</div>
    </body>
    </html>`;
}