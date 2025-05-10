import { NotificationPayLoad } from "../NotificationPayLoad";
import { NotificationResponse } from "../NotificationResponse";
import { PushNotificationService } from "../PushNotificationService";
import firebase from 'firebase-admin'
export interface FireBasePushNotificationOptions{
    databaseURL: string;
    projectId: string;
    clientEmail: string;
    privateKey: string;
    storageBucket?: string;
    serviceAccountId?: string;
}

export class FireBasePushNotificationService extends PushNotificationService{
    app: firebase.app.App
    constructor(public config: FireBasePushNotificationOptions){
        super();
        this.app = firebase.initializeApp({
            credential: firebase.credential.cert({
                clientEmail: config.clientEmail,
                privateKey: config.privateKey,
                projectId: config.projectId
            }),
            databaseURL: config.databaseURL,
            projectId: config.projectId,
            storageBucket: config.storageBucket,
            serviceAccountId: config.serviceAccountId
        })
    }
    public async send(payload: NotificationPayLoad): Promise<NotificationResponse> {
        var result: any = await new Promise((resolve, reject) => {
            const message: firebase.messaging.Message = {
                notification: {
                    title: payload.subject,
                    body: payload.message
                },
                data: payload.additional,
                token: payload.additional.token,
                
            }
            this.app.messaging().sendEachForMulticast(message as any).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        }).catch(console.error);
        if(result){
            return {
                id: result.successCount.toString(),
                status: true,
                message: "push notification sent successfully",
                additional: result
            };
        }
        else{
            return {
                id: "",
                status: false,
                message: "push notification failed",
                additional: result
            };
        }
    }
}