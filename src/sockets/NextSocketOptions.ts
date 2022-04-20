import { PerMessageDeflateOptions, ServerOptions, VerifyClientCallbackAsync, VerifyClientCallbackSync } from 'ws';
import { IncomingMessage } from "http";

export class NextSocketOptions implements ServerOptions {
    public debug: boolean = false;
    public routerDirs: string[] = [];
    public host?: string | undefined;
    public port?: number | undefined;
    public backlog?: number | undefined;
    public verifyClient?: VerifyClientCallbackAsync | VerifyClientCallbackSync | undefined;
    public handleProtocols?: (protocols: Set<string>, request: IncomingMessage) => string | false;
    public path?: string | undefined;
    public noServer?: boolean | undefined;
    public clientTracking?: boolean | undefined;
    public perMessageDeflate?: boolean | PerMessageDeflateOptions | undefined;
    public maxPayload?: number | undefined;
    public skipUTF8Validation?: boolean | undefined;
}
