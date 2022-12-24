import { ContactType } from '../ContactType';
import { MailNotificationService } from '../MailNotificationService'
import { NotificationPayLoad } from '../NotificationPayLoad';
import { NotificationResponse } from '../NotificationResponse';
import mimetypes from 'mime-types'
import crypto from 'crypto'
interface SMTPMailOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from?: string
}
export class SMTPMailService extends MailNotificationService {
    constructor(public config: SMTPMailOptions) {
        super();
    }
    public async send(payload: NotificationPayLoad): Promise<NotificationResponse> {
        var result = await new Promise((resolve, reject) => {
            const nodeMailer = require('nodemailer');
            const transporter = nodeMailer.createTransport({
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                auth: {
                    user: this.config.auth.user,
                    pass: this.config.auth.pass
                }
            });
            transporter.send({
                from: this.config.from,
                to: payload.contacts.map(c => c.type == ContactType.To),
                cc: payload.contacts.map(c => c.type == ContactType.Cc),
                bcc: payload.contacts.map(c => c.type == ContactType.Bcc),
                subject: payload.subject,
                text: payload.html ? (payload.plaintext || payload.message) : payload.plaintext,
                html: payload.html ? payload.message : payload.plaintext,
                attachments: payload.additional?.attachments.map(a => {
                    return {
                        filename: a.name,
                        content: a.content,
                        contentType: a.contentType || mimetypes.lookup(a.name)
                    }
                })
            }, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info);
                }
            })
        }).catch(console.error);
        if(result){
            return {
                id: crypto.randomUUID(),
                status: true,
                message: "mail sent successfully",
                additional: result
            };
        }
        else{
            return {
                id: crypto.randomUUID(),
                status: false,
                message: "mail sending failed",
                additional: result
            }
        }
    }
}