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
exports.NextObjectPlugin = exports.NextFSLocalManager = exports.NextFSLocalDirectory = exports.NextFSLocalFile = exports.NextFSType = exports.NextFSObject = exports.NextFSManager = exports.NextFSFile = exports.NextFSDirectory = exports.NextFlag = exports.NextAuthorizationBase = exports.NextAuthorization = exports.FileSystemProviderConfig = exports.FileSystemProvider = exports.ApiResponse = exports.RedisSessionStore = exports.InMemorySessionStore = exports.ISessionStore = exports.NextSessionOptions = exports.NextSessionManager = exports.ValidationError = exports.ValidationResult = exports.NextRouteResponseStatus = exports.NextRouteResponse = exports.NextFileResolverPlugin = exports.NextPlugin = exports.NextRegistry = exports.NextContextBase = exports.NextOptions = exports.NextApplication = exports.RequestParams = exports.NextKnexPlugin = void 0;
var NextKnexPlugin_1 = require("./plugins/NextKnexPlugin");
Object.defineProperty(exports, "NextKnexPlugin", { enumerable: true, get: function () { return NextKnexPlugin_1.NextKnexPlugin; } });
exports.RequestParams = __importStar(require("./RequestParams"));
var NextApplication_1 = require("./NextApplication");
Object.defineProperty(exports, "NextApplication", { enumerable: true, get: function () { return NextApplication_1.NextApplication; } });
var NextOptions_1 = require("./config/NextOptions");
Object.defineProperty(exports, "NextOptions", { enumerable: true, get: function () { return NextOptions_1.NextOptions; } });
var NextContext_1 = require("./NextContext");
Object.defineProperty(exports, "NextContextBase", { enumerable: true, get: function () { return NextContext_1.NextContextBase; } });
var NextRegistry_1 = require("./NextRegistry");
Object.defineProperty(exports, "NextRegistry", { enumerable: true, get: function () { return NextRegistry_1.NextRegistry; } });
var NextPlugin_1 = require("./plugins/NextPlugin");
Object.defineProperty(exports, "NextPlugin", { enumerable: true, get: function () { return NextPlugin_1.NextPlugin; } });
var NextFileResolverPlugin_1 = require("./plugins/NextFileResolverPlugin");
Object.defineProperty(exports, "NextFileResolverPlugin", { enumerable: true, get: function () { return NextFileResolverPlugin_1.NextFileResolverPlugin; } });
var NextRouteResponse_1 = require("./routing/NextRouteResponse");
Object.defineProperty(exports, "NextRouteResponse", { enumerable: true, get: function () { return NextRouteResponse_1.NextRouteResponse; } });
Object.defineProperty(exports, "NextRouteResponseStatus", { enumerable: true, get: function () { return NextRouteResponse_1.NextRouteResponseStatus; } });
var ValidationResult_1 = require("./validation/ValidationResult");
Object.defineProperty(exports, "ValidationResult", { enumerable: true, get: function () { return ValidationResult_1.ValidationResult; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return ValidationResult_1.ValidationError; } });
var NextSessionManager_1 = require("./session/NextSessionManager");
Object.defineProperty(exports, "NextSessionManager", { enumerable: true, get: function () { return NextSessionManager_1.NextSessionManager; } });
Object.defineProperty(exports, "NextSessionOptions", { enumerable: true, get: function () { return NextSessionManager_1.NextSessionOptions; } });
var ISessionStore_1 = require("./session/ISessionStore");
Object.defineProperty(exports, "ISessionStore", { enumerable: true, get: function () { return ISessionStore_1.ISessionStore; } });
var InMemorySessionStore_1 = require("./session/InMemorySessionStore");
Object.defineProperty(exports, "InMemorySessionStore", { enumerable: true, get: function () { return InMemorySessionStore_1.InMemorySessionStore; } });
var RedisSessionStore_1 = require("./session/RedisSessionStore");
Object.defineProperty(exports, "RedisSessionStore", { enumerable: true, get: function () { return RedisSessionStore_1.RedisSessionStore; } });
var ApiResponse_1 = require("./ApiResponse");
Object.defineProperty(exports, "ApiResponse", { enumerable: true, get: function () { return ApiResponse_1.ApiResponse; } });
var FileSystemProvider_1 = require("./storage/FileSystemProvider");
Object.defineProperty(exports, "FileSystemProvider", { enumerable: true, get: function () { return FileSystemProvider_1.FileSystemProvider; } });
Object.defineProperty(exports, "FileSystemProviderConfig", { enumerable: true, get: function () { return FileSystemProvider_1.FileSystemProviderConfig; } });
var NextAuthorization_1 = require("./authorization/NextAuthorization");
Object.defineProperty(exports, "NextAuthorization", { enumerable: true, get: function () { return NextAuthorization_1.NextAuthorization; } });
var NextAuthorizationBase_1 = require("./authorization/NextAuthorizationBase");
Object.defineProperty(exports, "NextAuthorizationBase", { enumerable: true, get: function () { return NextAuthorizationBase_1.NextAuthorizationBase; } });
var NextFlag_1 = require("./NextFlag");
Object.defineProperty(exports, "NextFlag", { enumerable: true, get: function () { return NextFlag_1.NextFlag; } });
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
var NextObjectPlugin_1 = require("./plugins/NextObjectPlugin");
Object.defineProperty(exports, "NextObjectPlugin", { enumerable: true, get: function () { return NextObjectPlugin_1.NextObjectPlugin; } });
