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
export { ObjectRouter } from './routing/ObjectRouter'

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
export { RetrieveUserBuilder, EncodePasswordOptions } from './authentication/helpers/RetrieveUserBuilder'
export * from './authentication/helpers/PasswordUtils'

/*
AUTHORIZATION
*/
export { NextAuthorization } from './authorization/NextAuthorization';
export { NextAuthorizationBase } from './authorization/NextAuthorizationBase';
export { NextPermissionDefinition as NextPermission } from './authorization/NextPermission';
export { NextUser, NextRole, NextTeam } from './authorization/NextAuthorization';

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
export { NextSocketRedisOptions } from './sockets/NextSocketRedisOptions'
export { NextSocketRedisAdapter } from './sockets/NextSocketRedisAdapter'
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

/*
WORKFLOWS
*/

export { WorkflowExecutionResult } from './workflows/WorkflowExecutionResult';
export { WorkflowExecuteContext } from './workflows/WorkflowExecuteContext';
export { WorkflowRoute } from './workflows/WorkflowRoute';
export { WorkflowRouteAction } from './workflows/WorkflowRouteAction';
export { WorkflowRouteActionResult } from './workflows/WorkflowRouteActionResult';
export { WorkflowRouter } from './workflows/WorkflowRouter';

/*
CONFIGURATIONS
*/

export { ConfigurationReader } from './config/ConfigurationReader';
export { ConfigurationFileType } from './config/ConfigurationReader';
/*
import { TwilioSMSNotificationService } from "./services/sms/TwilioSMSNotificationService";
import { SMTPMailService } from "./services/mail/SMTPMailService";
import { SendGridMailService } from "./services/mail/SendGridMailService";
import { FireBasePushNotificationService } from "./services/push/FireBasePushNotificationService";
import { WebhookNotificationService } from "./services/webhook/WebhookNotificationService";

export const Services = {
    MailServices: {
        SMTPMailService: SMTPMailService,
        SendGridMailService: SendGridMailService
    },
    SMSServices: {
        TwilioSMSService: TwilioSMSNotificationService,
    },
    PushServices: {
        FireBasePushNotificationService: FireBasePushNotificationService
    },
    WebhookServices: {
        WebhookNotificationService: WebhookNotificationService
    }
}
    */