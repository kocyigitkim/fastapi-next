import { MailNotificationService } from "./MailNotificationService";
import { NotificationService } from "./NotificationService";
import { NotificationServiceRegistration } from "./NotificationServiceRegistration";
import { NotificationTypes } from "./NotificationTypes";
import { PushNotificationService } from "./PushNotificationService";
import { SMSNotificationService } from "./SMSNotificationService";
import { WebNotificationService } from "./WebNotificationService";


export class NotificationServices {
    private static services: NotificationServiceRegistration[] = [];
    public static get SMS(): SMSNotificationService {
        return NotificationServices.services.find(item => item.type == NotificationTypes.SMS && item.isDefault) as any;
    }
    public static get Mail(): MailNotificationService {
        return NotificationServices.services.find(item => item.type == NotificationTypes.Mail && item.isDefault) as any;
    }
    public static get PushNotification(): PushNotificationService {
        return NotificationServices.services.find(item => item.type == NotificationTypes.Push && item.isDefault) as any;
    }
    public static get WebNotification(): WebNotificationService {
        return NotificationServices.services.find(item => item.type == NotificationTypes.Web && item.isDefault) as any;
    }
    public static setAsDefault(serviceName: string, serviceType: string) {
        let service = NotificationServices.services.find(item => item.name == serviceName && item.type == serviceType);
        if (service) {
            service.isDefault = true;
        }
    }
    public static registerService(service: NotificationService) {
        let serviceRegistration = NotificationServices.services.find(item => item.name == service.constructor.name);
        if (serviceRegistration) {
            serviceRegistration.initiator = service.constructor;
        } else {
            NotificationServices.services.push({
                type: service.constructor.name,
                name: service.constructor.name,
                initiator: service.constructor,
                isDefault: false
            });
        }
    }
    public static getService(serviceName: string, serviceType: string) {
        let service = NotificationServices.services.find(item => item.name == serviceName && item.type == serviceType);
        if (service) {
            return new (service.initiator as any)();
        }
        return null;
    }
}
