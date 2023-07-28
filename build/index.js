"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.NotificationResponse = exports.NotificationPayLoad = exports.NotificationContact = exports.MailNotificationService = exports.ContactType = exports.NextHttpFileStream = exports.NextSocketOptions = exports.ParallelJobState = exports.ParallelJob = exports.NextFSLocalManager = exports.NextFSLocalDirectory = exports.NextFSLocalFile = exports.NextFSType = exports.NextFSObject = exports.NextFSManager = exports.NextFSFile = exports.NextFSDirectory = exports.FileSystemProviderConfig = exports.FileSystemProvider = exports.NextAuthorizationBase = exports.NextAuthorization = exports.RetrieveUserBuilder = exports.NextPassportAuthenticationMethod = exports.NextTwoFactorAuthenticationMethod = exports.NextBasicAuthenticationMethod = exports.NextAuthenticationMethod = exports.NextAuthentication = exports.RedisSessionStore = exports.InMemorySessionStore = exports.ISessionStore = exports.NextSessionOptions = exports.NextSessionManager = exports.NextObjectPlugin = exports.NextFileResolverPlugin = exports.NextKnexPlugin = exports.NextPlugin = exports.NextRegistry = exports.RequestParams = exports.NextFlag = exports.ObjectRouter = exports.NextClientBuilder = exports.ValidationError = exports.ValidationResult = exports.NextRouteResponseStatus = exports.NextRouteResponse = exports.ApiResponse = exports.NextContextBase = exports.NextOptions = exports.NextApplication = void 0;
exports.WebNotificationService = exports.SMSNotificationService = exports.PushNotificationService = exports.NotificationTypes = exports.NotificationServices = void 0;
/*
BASE COMPONENTS
*/
var NextApplication_1 = require("./NextApplication");
Object.defineProperty(exports, "NextApplication", { enumerable: true, get: function () { return NextApplication_1.NextApplication; } });
var NextOptions_1 = require("./config/NextOptions");
Object.defineProperty(exports, "NextOptions", { enumerable: true, get: function () { return NextOptions_1.NextOptions; } });
var NextContext_1 = require("./NextContext");
Object.defineProperty(exports, "NextContextBase", { enumerable: true, get: function () { return NextContext_1.NextContextBase; } });
var ApiResponse_1 = require("./ApiResponse");
Object.defineProperty(exports, "ApiResponse", { enumerable: true, get: function () { return ApiResponse_1.ApiResponse; } });
var NextRouteResponse_1 = require("./routing/NextRouteResponse");
Object.defineProperty(exports, "NextRouteResponse", { enumerable: true, get: function () { return NextRouteResponse_1.NextRouteResponse; } });
Object.defineProperty(exports, "NextRouteResponseStatus", { enumerable: true, get: function () { return NextRouteResponse_1.NextRouteResponseStatus; } });
var ValidationResult_1 = require("./validation/ValidationResult");
Object.defineProperty(exports, "ValidationResult", { enumerable: true, get: function () { return ValidationResult_1.ValidationResult; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return ValidationResult_1.ValidationError; } });
var NextClientBuilder_1 = require("./client/NextClientBuilder");
Object.defineProperty(exports, "NextClientBuilder", { enumerable: true, get: function () { return NextClientBuilder_1.NextClientBuilder; } });
var ObjectRouter_1 = require("./routing/ObjectRouter");
Object.defineProperty(exports, "ObjectRouter", { enumerable: true, get: function () { return ObjectRouter_1.ObjectRouter; } });
/*
STRUCTURES
*/
var NextFlag_1 = require("./NextFlag");
Object.defineProperty(exports, "NextFlag", { enumerable: true, get: function () { return NextFlag_1.NextFlag; } });
exports.RequestParams = __importStar(require("./RequestParams"));
/*
PLUGINS
 */
var NextRegistry_1 = require("./NextRegistry");
Object.defineProperty(exports, "NextRegistry", { enumerable: true, get: function () { return NextRegistry_1.NextRegistry; } });
var NextPlugin_1 = require("./plugins/NextPlugin");
Object.defineProperty(exports, "NextPlugin", { enumerable: true, get: function () { return NextPlugin_1.NextPlugin; } });
var NextKnexPlugin_1 = require("./plugins/NextKnexPlugin");
Object.defineProperty(exports, "NextKnexPlugin", { enumerable: true, get: function () { return NextKnexPlugin_1.NextKnexPlugin; } });
var NextFileResolverPlugin_1 = require("./plugins/NextFileResolverPlugin");
Object.defineProperty(exports, "NextFileResolverPlugin", { enumerable: true, get: function () { return NextFileResolverPlugin_1.NextFileResolverPlugin; } });
var NextObjectPlugin_1 = require("./plugins/NextObjectPlugin");
Object.defineProperty(exports, "NextObjectPlugin", { enumerable: true, get: function () { return NextObjectPlugin_1.NextObjectPlugin; } });
/*
SESSION MANAGEMENT
*/
var NextSessionManager_1 = require("./session/NextSessionManager");
Object.defineProperty(exports, "NextSessionManager", { enumerable: true, get: function () { return NextSessionManager_1.NextSessionManager; } });
Object.defineProperty(exports, "NextSessionOptions", { enumerable: true, get: function () { return NextSessionManager_1.NextSessionOptions; } });
var ISessionStore_1 = require("./session/ISessionStore");
Object.defineProperty(exports, "ISessionStore", { enumerable: true, get: function () { return ISessionStore_1.ISessionStore; } });
var InMemorySessionStore_1 = require("./session/InMemorySessionStore");
Object.defineProperty(exports, "InMemorySessionStore", { enumerable: true, get: function () { return InMemorySessionStore_1.InMemorySessionStore; } });
var RedisSessionStore_1 = require("./session/RedisSessionStore");
Object.defineProperty(exports, "RedisSessionStore", { enumerable: true, get: function () { return RedisSessionStore_1.RedisSessionStore; } });
/*
AUTHENTICATION
 */
var NextAuthentication_1 = require("./authentication/NextAuthentication");
Object.defineProperty(exports, "NextAuthentication", { enumerable: true, get: function () { return NextAuthentication_1.NextAuthentication; } });
var NextAuthenticationMethod_1 = require("./authentication/NextAuthenticationMethod");
Object.defineProperty(exports, "NextAuthenticationMethod", { enumerable: true, get: function () { return NextAuthenticationMethod_1.NextAuthenticationMethod; } });
var NextBasicAuthenticationMethod_1 = require("./authentication/methods/NextBasicAuthenticationMethod");
Object.defineProperty(exports, "NextBasicAuthenticationMethod", { enumerable: true, get: function () { return NextBasicAuthenticationMethod_1.NextBasicAuthenticationMethod; } });
var NextTwoFactorAuthenticationMethod_1 = require("./authentication/methods/NextTwoFactorAuthenticationMethod");
Object.defineProperty(exports, "NextTwoFactorAuthenticationMethod", { enumerable: true, get: function () { return NextTwoFactorAuthenticationMethod_1.NextTwoFactorAuthenticationMethod; } });
var NextPassportAuthenticationMethod_1 = require("./authentication/methods/NextPassportAuthenticationMethod");
Object.defineProperty(exports, "NextPassportAuthenticationMethod", { enumerable: true, get: function () { return NextPassportAuthenticationMethod_1.NextPassportAuthenticationMethod; } });
var RetrieveUserBuilder_1 = require("./authentication/helpers/RetrieveUserBuilder");
Object.defineProperty(exports, "RetrieveUserBuilder", { enumerable: true, get: function () { return RetrieveUserBuilder_1.RetrieveUserBuilder; } });
/*
AUTHORIZATION
*/
var NextAuthorization_1 = require("./authorization/NextAuthorization");
Object.defineProperty(exports, "NextAuthorization", { enumerable: true, get: function () { return NextAuthorization_1.NextAuthorization; } });
var NextAuthorizationBase_1 = require("./authorization/NextAuthorizationBase");
Object.defineProperty(exports, "NextAuthorizationBase", { enumerable: true, get: function () { return NextAuthorizationBase_1.NextAuthorizationBase; } });
/*
IO COMPONENTS
*/
var FileSystemProvider_1 = require("./storage/FileSystemProvider");
Object.defineProperty(exports, "FileSystemProvider", { enumerable: true, get: function () { return FileSystemProvider_1.FileSystemProvider; } });
Object.defineProperty(exports, "FileSystemProviderConfig", { enumerable: true, get: function () { return FileSystemProvider_1.FileSystemProviderConfig; } });
var NextFSDirectory_1 = require("./filesystem/NextFSDirectory");
Object.defineProperty(exports, "NextFSDirectory", { enumerable: true, get: function () { return NextFSDirectory_1.NextFSDirectory; } });
var NextFSFile_1 = require("./filesystem/NextFSFile");
Object.defineProperty(exports, "NextFSFile", { enumerable: true, get: function () { return NextFSFile_1.NextFSFile; } });
var NextFSManager_1 = require("./filesystem/NextFSManager");
Object.defineProperty(exports, "NextFSManager", { enumerable: true, get: function () { return NextFSManager_1.NextFSManager; } });
var NextFSObject_1 = require("./filesystem/NextFSObject");
Object.defineProperty(exports, "NextFSObject", { enumerable: true, get: function () { return NextFSObject_1.NextFSObject; } });
var NextFSType_1 = require("./filesystem/NextFSType");
Object.defineProperty(exports, "NextFSType", { enumerable: true, get: function () { return NextFSType_1.NextFSType; } });
var NextFSLocalFile_1 = require("./filesystem/localfs/NextFSLocalFile");
Object.defineProperty(exports, "NextFSLocalFile", { enumerable: true, get: function () { return NextFSLocalFile_1.NextFSLocalFile; } });
var NextFSLocalDirectory_1 = require("./filesystem/localfs/NextFSLocalDirectory");
Object.defineProperty(exports, "NextFSLocalDirectory", { enumerable: true, get: function () { return NextFSLocalDirectory_1.NextFSLocalDirectory; } });
var NextFSLocalManager_1 = require("./filesystem/localfs/NextFSLocalManager");
Object.defineProperty(exports, "NextFSLocalManager", { enumerable: true, get: function () { return NextFSLocalManager_1.NextFSLocalManager; } });
/*
THREADING
*/
var ParallelJob_1 = require("./parallelism/ParallelJob");
Object.defineProperty(exports, "ParallelJob", { enumerable: true, get: function () { return ParallelJob_1.ParallelJob; } });
var ParallelJobState_1 = require("./parallelism/ParallelJobState");
Object.defineProperty(exports, "ParallelJobState", { enumerable: true, get: function () { return ParallelJobState_1.ParallelJobState; } });
/*
STREAMING
*/
var NextSocketOptions_1 = require("./sockets/NextSocketOptions");
Object.defineProperty(exports, "NextSocketOptions", { enumerable: true, get: function () { return NextSocketOptions_1.NextSocketOptions; } });
var NextHttpFileStream_1 = require("./streaming/NextHttpFileStream");
Object.defineProperty(exports, "NextHttpFileStream", { enumerable: true, get: function () { return NextHttpFileStream_1.NextHttpFileStream; } });
/*
NOTIFICATION SERVICES
*/
var ContactType_1 = require("./services/ContactType");
Object.defineProperty(exports, "ContactType", { enumerable: true, get: function () { return ContactType_1.ContactType; } });
var MailNotificationService_1 = require("./services/MailNotificationService");
Object.defineProperty(exports, "MailNotificationService", { enumerable: true, get: function () { return MailNotificationService_1.MailNotificationService; } });
var NotificationContact_1 = require("./services/NotificationContact");
Object.defineProperty(exports, "NotificationContact", { enumerable: true, get: function () { return NotificationContact_1.NotificationContact; } });
var NotificationPayLoad_1 = require("./services/NotificationPayLoad");
Object.defineProperty(exports, "NotificationPayLoad", { enumerable: true, get: function () { return NotificationPayLoad_1.NotificationPayLoad; } });
var NotificationResponse_1 = require("./services/NotificationResponse");
Object.defineProperty(exports, "NotificationResponse", { enumerable: true, get: function () { return NotificationResponse_1.NotificationResponse; } });
var NotificationService_1 = require("./services/NotificationService");
Object.defineProperty(exports, "NotificationService", { enumerable: true, get: function () { return NotificationService_1.NotificationService; } });
var NotificationServices_1 = require("./services/NotificationServices");
Object.defineProperty(exports, "NotificationServices", { enumerable: true, get: function () { return NotificationServices_1.NotificationServices; } });
var NotificationTypes_1 = require("./services/NotificationTypes");
Object.defineProperty(exports, "NotificationTypes", { enumerable: true, get: function () { return NotificationTypes_1.NotificationTypes; } });
var PushNotificationService_1 = require("./services/PushNotificationService");
Object.defineProperty(exports, "PushNotificationService", { enumerable: true, get: function () { return PushNotificationService_1.PushNotificationService; } });
var SMSNotificationService_1 = require("./services/SMSNotificationService");
Object.defineProperty(exports, "SMSNotificationService", { enumerable: true, get: function () { return SMSNotificationService_1.SMSNotificationService; } });
var WebNotificationService_1 = require("./services/WebNotificationService");
Object.defineProperty(exports, "WebNotificationService", { enumerable: true, get: function () { return WebNotificationService_1.WebNotificationService; } });
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
