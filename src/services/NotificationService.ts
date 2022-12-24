import { NextApplication } from "../NextApplication";
import { NotificationPayLoad } from "./NotificationPayLoad";
import { NotificationResponse } from "./NotificationResponse";


export class NotificationService {
    public register(app: NextApplication) { }
    public unregister(app: NextApplication) { }
    public send(payload: NotificationPayLoad): Promise<NotificationResponse> {
        return new Promise((resolve, reject) => {
            resolve(new NotificationResponse());
        });
    }
}
