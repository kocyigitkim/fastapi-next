/*
BASE COMPONENTS
*/
export { NextApplication } from "./NextApplication";
export { NextOptions } from "./config/NextOptions";
export { NextContextBase, NextContext, INextContextBase } from "./NextContext";
export { ApiResponse } from './ApiResponse';
export { NextRouteResponse, NextRouteResponseStatus } from './routing/NextRouteResponse';
export { ValidationResult, ValidationError } from './validation/ValidationResult';
export { NextClientBuilder } from './client/NextClientBuilder'

/*
STRUCTURES
*/
export { NextFlag } from './NextFlag'
export * as RequestParams from './RequestParams';

/*
PLUGINS
 */
export { NextRegistry } from "./NextRegistry";
export { NextPlugin } from "./plugins/NextPlugin";
export { NextKnexPlugin } from './plugins/NextKnexPlugin';
export { NextFileResolverPlugin } from './plugins/NextFileResolverPlugin';
export { NextObjectPlugin } from './plugins/NextObjectPlugin'

/*
SESSION MANAGEMENT
*/
export { NextSessionManager, NextSessionOptions } from './session/NextSessionManager'
export { ISessionStore } from './session/ISessionStore'
export { InMemorySessionStore, InMemorySessionConfig } from './session/InMemorySessionStore'
export { RedisSessionStore, RedisOptions } from './session/RedisSessionStore'

/*
AUTHENTICATION
 */
export { NextAuthentication } from './authentication/NextAuthentication';
export { NextAuthenticationMethod } from './authentication/NextAuthenticationMethod'
export { NextBasicAuthenticationMethod } from './authentication/methods/NextBasicAuthenticationMethod'
export { NextTwoFactorAuthenticationMethod } from './authentication/methods/NextTwoFactorAuthenticationMethod'
export { NextPassportAuthenticationMethod } from './authentication/methods/NextPassportAuthenticationMethod'
export { RetrieveUserBuilder } from './authentication/helpers/RetrieveUserBuilder'

/*
AUTHORIZATION
*/
export { NextAuthorization } from './authorization/NextAuthorization';
export { NextAuthorizationBase } from './authorization/NextAuthorizationBase';
export { NextPermissionDefinition as NextPermission } from './authorization/NextPermission';

/*
IO COMPONENTS
*/
export { FileSystemProvider, FileSystemProviderConfig } from './storage/FileSystemProvider';
export { NextFSDirectory } from './filesystem/NextFSDirectory'
export { NextFSFile } from './filesystem/NextFSFile'
export { NextFSManager } from './filesystem/NextFSManager'
export { NextFSObject } from './filesystem/NextFSObject'
export { NextFSType } from './filesystem/NextFSType'
export { NextFSLocalFile } from './filesystem/localfs/NextFSLocalFile'
export { NextFSLocalDirectory } from './filesystem/localfs/NextFSLocalDirectory'
export { NextFSLocalManager } from './filesystem/localfs/NextFSLocalManager'

/*
THREADING
*/
export { ParallelJob } from './parallelism/ParallelJob'
export type { ParallelJobEventNames } from './parallelism/ParallelJobEventNames'
export { ParallelJobState } from './parallelism/ParallelJobState'

/*
STREAMING
*/
export { NextSocketOptions } from './sockets/NextSocketOptions'
export { NextHttpFileStream } from './streaming/NextHttpFileStream'

/*
NOTIFICATION SERVICES
*/
export { ContactType } from './services/ContactType'
export { MailNotificationService } from './services/MailNotificationService'
export { NotificationContact } from './services/NotificationContact'
export { NotificationPayLoad } from './services/NotificationPayLoad'
export { NotificationResponse } from './services/NotificationResponse'
export { NotificationService } from './services/NotificationService'
export { NotificationServiceRegistration } from './services/NotificationServiceRegistration'
export { NotificationServices } from './services/NotificationServices'
export { NotificationTypes } from './services/NotificationTypes'
export { PushNotificationService } from './services/PushNotificationService'
export { SMSNotificationService } from './services/SMSNotificationService'
export { WebNotificationService } from './services/WebNotificationService'

// import { TwilioSMSNotificationService } from "./services/sms/TwilioSMSNotificationService";
// import { SMTPMailService } from "./services/mail/SMTPMailService";
// import { FireBasePushNotificationService } from "./services/push/FireBasePushNotificationService";

// export const Services = {
//     MailServices: {
//         SMTPMailService: SMTPMailService,
//     },
//     SMSServices: {
//         TwilioSMSService: TwilioSMSNotificationService,
//     },
//     PushServices: {
//         FireBasePushNotificationService: FireBasePushNotificationService
//     }
// }