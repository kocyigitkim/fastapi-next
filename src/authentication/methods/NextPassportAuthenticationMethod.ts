import { NextAuthenticationMethod, NextContextBase } from "../..";
import { NextAuthenticationResult } from "../NextAuthenticationResult";
import { Strategy, Passport } from 'passport'

export class NextPassportAuthenticationMethod extends NextAuthenticationMethod {
    public static methodName: string = "Passport";
    private passport = new Passport();
    private redirectUrl: string;
    private name: string;
    constructor() {
        super();
    }
    // #region Authentication Methods
    public google(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],

    }) {
        this.basePath = options.basePath || "/auth/passport/google";
        this.passport.use("google", new (require.main.require('passport-google-oauth20').Strategy)({
            clientID: options.clientId,
            clientSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['profile', 'email']
        }, (accessToken, refreshToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "google";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public apple(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        teamId: string,
        keyId: string,
        scope?: string[],

    }) {
        this.basePath = options.basePath || "/auth/passport/apple";
        this.passport.use("apple", new (require.main.require('passport-apple').Strategy)({
            clientID: options.clientId,
            teamID: options.teamId,
            keyID: options.keyId,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['name', 'email']
        }, (accessToken, refreshToken, idToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, idToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "apple";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public facebook(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],

    }) {
        this.basePath = options.basePath || "/auth/passport/facebook";
        this.passport.use("facebook", new (require.main.require('passport-facebook').Strategy)({
            clientID: options.clientId,
            clientSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['email']
        }, (accessToken, refreshToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "facebook";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public twitter(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],
    }) {
        this.basePath = options.basePath || "/auth/passport/twitter";
        this.passport.use("twitter", new (require.main.require('passport-twitter').Strategy)({
            consumerKey: options.clientId,
            consumerSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['email']
        }, (accessToken, refreshToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "twitter";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public github(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],
    }) {
        this.basePath = options.basePath || "/auth/passport/github";
        this.passport.use("github", new (require.main.require('passport-github').Strategy)({
            clientID: options.clientId,
            clientSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['email']
        }, (accessToken, refreshToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "github";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public linkedin(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],
    }) {
        this.basePath = options.basePath || "/auth/passport/linkedin";
        this.passport.use("linkedin", new (require.main.require('passport-linkedin-oauth2').Strategy)({
            clientID: options.clientId,
            clientSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['email']
        }, (accessToken, refreshToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "linkedin";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public instagram(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],
    }) {
        this.basePath = options.basePath || "/auth/passport/instagram";
        this.passport.use("instagram", new (require.main.require('passport-instagram').Strategy)({
            clientID: options.clientId,
            clientSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['email']
        }, (accessToken, refreshToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "instagram";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public spotify(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],
    }) {
        this.basePath = options.basePath || "/auth/passport/spotify";
        this.passport.use("spotify", new (require.main.require('passport-spotify').Strategy)({
            clientID: options.clientId,
            clientSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['email']
        }, (accessToken, refreshToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "spotify";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public microsoft(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],
    }) {
        this.basePath = options.basePath || "/auth/passport/microsoft";
        this.passport.use("microsoft", new (require.main.require('passport-microsoft').Strategy)({
            clientID: options.clientId,
            clientSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['email']
        }, (accessToken, refreshToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "microsoft";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public auth0(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],
    }) {
        this.basePath = options.basePath || "/auth/passport/auth0";
        this.passport.use("auth0", new (require.main.require('passport-auth0').Strategy)({
            clientID: options.clientId,
            clientSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/callback",
            scope: options.scope || ['email']
        }, (accessToken, refreshToken, profile, cb) => {
            cb(null, { accessToken, refreshToken, profile });
        }));
        this.loginMethod = "get";
        this.name = "auth0";
        this.validateMethod = "get";
        this.validatePath = "/callback";
        return this;
    }
    public openid(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],
    }) {
        this.basePath = options.basePath || "/auth/passport/openid";
        this.passport.use("openid", new (require.main.require('passport-openid').Strategy)({
            clientID: options.clientId,
            clientSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['email']
        }, (identifier, profile, done) => {
            profile.identifier = identifier;
            done(null, profile);
        }));
        this.loginMethod = "get";
        this.name = "openid";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }
    public oauth(options: {
        basePath?: string,
        hostname: string,
        clientId: string,
        clientSecret: string,
        scope?: string[],
    }) {
        this.basePath = options.basePath || "/auth/passport/oauth";
        this.passport.use("oauth", new (require.main.require('passport-oauth').OAuthStrategy)({
            requestTokenURL: options.hostname + this.basePath + "/oauth/request_token",
            accessTokenURL: options.hostname + this.basePath + "/oauth/access_token",
            userAuthorizationURL: options.hostname + this.basePath + "/oauth/authorize",
            consumerKey: options.clientId,
            consumerSecret: options.clientSecret,
            callbackURL: options.hostname + this.basePath + "/oauth2/callback",
            scope: options.scope || ['email']
        }, (token, tokenSecret, profile, cb) => {
            cb(null, { token, tokenSecret, profile });
        }));
        this.loginMethod = "get";
        this.name = "oauth";
        this.validateMethod = "get";
        this.validatePath = "/oauth2/callback";
        return this;
    }

    //#endregion

    public async login(context: NextContextBase): Promise<NextAuthenticationResult> {
        var result = new NextAuthenticationResult();
        const auth = this.passport.authenticate(this.name, {} as any);
        auth(context.req, context.res, context.next);
        result.prevent = true;
        return result;
    }
    public async validate(context: NextContextBase): Promise<NextAuthenticationResult> {
        return new Promise((resolve) => {
            var result = new NextAuthenticationResult();
            try {
                const auth = this.passport.authenticate(this.name, {}, (err, info) => {
                    if (info && info.profile) {
                        result.user = {
                            id: info.profile.id,
                            //given name
                            name: info.profile.name.givenName,
                            //family name
                            surname: info.profile.name.familyName,
                            //email
                            email: info.profile?.emails?.length > 0 && info.profile.emails[0].value,
                            //picture
                            additionalInfo: {
                                picture: info.profile?.photos?.length > 0 && info.profile.photos[0].value,
                                pictures: info.profile.photos,
                                emails: info.profile.emails,
                                phones: info.profile.phonenumbers,
                            },
                            phone: info.profile.phonenumbers?.length > 0 && info.profile.phonenumbers[0].value,

                        };
                        result.method = this.name;
                        result.success = true;
                        result.prevent = true;
                        resolve(result);
                        context.res.status(200).send({
                            success: true
                        });
                    }
                    else {
                        result.error = err;
                        result.success = false;
                        resolve(result);
                    }

                });

                auth(context.req, context.res, context.next);
            } catch (e) {
                resolve(result);
            }
        });

    }
}