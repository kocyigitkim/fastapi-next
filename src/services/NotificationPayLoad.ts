import { NotificationContact } from "./NotificationContact";


export class NotificationPayLoad {
    public contacts: NotificationContact[];
    public message: string;
    public plaintext?: string;
    public subject?: string;
    public html?: boolean;
    public additional?: {
        [key: string]: any,
        attachments?: {
            name: string,
            content: string,
            contentType?: string
        }[]
    };
}
