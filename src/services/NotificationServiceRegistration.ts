export interface NotificationServiceRegistration {
    type: string;
    name: string;
    initiator: Function;
    isDefault: boolean;
}
