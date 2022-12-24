import { NotificationPayLoad } from "../NotificationPayLoad";
import { NotificationResponse } from "../NotificationResponse";
import { SMSNotificationService } from "../SMSNotificationService";

export interface TwilioSMSOptions{
    accountSid: string;
    authToken: string;
    from: string;
}

export class TwilioSMSNotificationService extends SMSNotificationService{
public constructor(public options: TwilioSMSOptions){
    super();
}
    public send(payload: NotificationPayLoad): Promise<NotificationResponse> {
        const twilio = require('twilio');
        const client = twilio(this.options.accountSid, this.options.authToken);
        return new Promise((resolve, reject) => {
            client.messages.create({
                body: payload.message,
                from: this.options.from,
                to: payload.contacts.map(c => c.address).join(',')
            }).then((message) => {
                resolve({
                    id: message.sid,
                    status: true,
                    message: "SMS sent successfully",
                    additional: message
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }
}