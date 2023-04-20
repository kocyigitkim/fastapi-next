import fs from 'fs';
import path from 'path';
import { NextContextBase } from '../NextContext';

export interface NextHttpFileStreamOptions {
    filePath: string,
    contentType?: string,
    downloadName?: string,
    cacheControl?: string,
    headers?: { [key: string]: string },
    partial?: boolean,
    maxPartialCount?: number
}

export interface NextHttpBufferStreamOptions {
    buffer: Buffer,
    contentType?: string,
    downloadName?: string,
    cacheControl?: string,
    headers?: { [key: string]: string },
    partial?: boolean,
    maxPartialCount?: number
}

export class NextHttpFileStream {
    public static async streamFile(context: NextContextBase, options: NextHttpFileStreamOptions) {
        if (options.filePath) {
            if (fs.existsSync(options.filePath)) {
                var stat = fs.statSync(options.filePath);
                var total = stat.size;
                var range = context.req.headers.range;
                var positions = range ? range.replace(/bytes=/, "").split("-") : ["0", (total - 1).toString()];
                var start = parseInt(positions[0], 10);
                var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
                var chunksize = (end - start) + 1;
                var file = fs.createReadStream(options.filePath, { start: start, end: end });
                var head = {
                    'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': options.contentType || 'application/octet-stream',
                    'Cache-Control': options.cacheControl || 'no-cache'
                };
                if (options.downloadName) {
                    head['Content-Disposition'] = `attachment; filename="${options.downloadName}"`;
                }
                if (options.headers) {
                    for (var key in options.headers) {
                        head[key] = options.headers[key];
                    }
                }
                context.res.writeHead(206, head);
                file.pipe(context.res);
                return;
            }
        }
        context.res.status(404);
        context.res.send("File not found");
    }
    public static async streamBuffer(context: NextContextBase, options: NextHttpBufferStreamOptions) {
        var total = options.buffer.length;
        var range = context.req.headers.range;
        var positions = range ? range.replace(/bytes=/, "").split("-") : ["0", (total - 1).toString()];
        var start = parseInt(positions[0], 10);
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;
        var head = {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': options.contentType || 'application/octet-stream',
            'Cache-Control': options.cacheControl || 'no-cache'
        };
        if (options.downloadName) {
            head['Content-Disposition'] = `attachment; filename="${options.downloadName}"`;
        }
        if (options.headers) {
            for (var key in options.headers) {
                head[key] = options.headers[key];
            }
        }
        context.res.writeHead(206, head);
        context.res.send(options.buffer);
    }
}