import { NextFunction, Request, Response } from "express";
import jwt, { Algorithm as JWTAlgorithm, VerifyOptions as JWTVerifyOptions, SignOptions as JWTSignOptions, JwtPayload } from 'jsonwebtoken';

import { NextApplication } from "../../NextApplication";
import { ApiResponse } from "../../ApiResponse";
import { getTokenFromHeader, normalizeUrlPath } from "../../utils";


export class JWTController {
    public algorithm: JWTAlgorithm = "HS256";
    public secret: string = "secret";
    public checkIfGranted: (req: Request) => Promise<boolean> = () => new Promise(resolve => resolve(true));
    public verifyOptions: JWTVerifyOptions = null;
    public verifyPayload: (payload: any) => Promise<any> = (payload) => new Promise(resolve => resolve(payload));
    public signOptions: JWTSignOptions = null;
    public createPayload: (req: Request, app: NextApplication, additional: any) => Promise<any> = (req, app) => new Promise(resolve => resolve({}));
    public anonymousPaths: (string | RegExp)[] = [];
    public messages = {
        unauthorized: "Unauthorized",
        invalidToken: "Invalid token"
    }
    public refreshWhen: (payload: JwtPayload) => Promise<boolean> = (payload) => new Promise(resolve => {
        var isTokenExpired = payload.exp && payload.exp < new Date().getTime();
        resolve(isTokenExpired);
    });
    public constructor(public app: NextApplication) {
        this.checkIfGranted = this.checkIfGranted.bind(this);
        this.RegisterVerify = this.RegisterVerify.bind(this);
        this.RegisterRefresh = this.RegisterRefresh.bind(this);
        this.CreateToken = this.CreateToken.bind(this);
    }
    public RegisterVerify() {
        this.app.express.use(async (req: Request, res: Response, next: NextFunction) => {
            const serviceToken = getTokenFromHeader(req.headers && req.headers.authorization);
            const granted = await this.checkIfGranted(req);
            const path = normalizeUrlPath(req.path);
            if (path === "auth/login") {
                next();
                return;
            }

            if (Array.isArray(this.anonymousPaths)) {
                for (var p of this.anonymousPaths) {
                    if (p instanceof RegExp) {
                        if (p.test(path)) {
                            next();
                            return;
                        }
                    }
                    else {
                        if (p == path) {
                            next();
                            return;
                        }
                    }
                }
            }

            if (serviceToken && granted) {
                jwt.verify(serviceToken, this.secret, {
                    ...this.verifyOptions,
                    algorithms: [this.algorithm]
                }, (err, decoded) => {
                    if (err) {
                        res.status(401).json(new ApiResponse().setError(this.messages.invalidToken));
                        return;
                    }
                    else {
                        var payload = decoded as any;
                        this.verifyPayload(payload).then(result => {
                            next();
                        }).catch(err => {
                            res.status(401).json(new ApiResponse().setError(this.messages.unauthorized));
                        });
                    }
                });
            }
            else {
                res.status(401).json(new ApiResponse(false, this.messages.unauthorized));
            }
        });
    }
    public RegisterRefresh() {
        this.app.express.use(async (req: Request, res: Response, next: NextFunction) => {
            const serviceToken = getTokenFromHeader(req.headers && req.headers.authorization);
            const granted = await this.checkIfGranted(req);
            if (serviceToken && granted) {
                jwt.verify(serviceToken, this.secret, {
                    ...this.verifyOptions,
                    algorithms: [this.algorithm]
                }, (err, decoded) => {
                    if (err) {
                        res.status(401).json(new ApiResponse().setError(this.messages.unauthorized));
                        return;
                    }
                    else {
                        var payload = decoded;
                        this.verifyPayload(payload).then(async payload => {
                            if (!await this.refreshWhen(payload)) {
                                next();
                                return;
                            }
                            if (payload.exp) {
                                delete payload.exp;
                            }
                            var generatedToken = this.CreateToken(req);
                            (req as any).refreshToken = generatedToken;
                            res.send = ((originalSend, refreshToken, body) => {
                                if (!body) {
                                    body = {};
                                }
                                body.refreshToken = refreshToken;
                                originalSend(body);
                            }).bind(res, res.send, generatedToken);
                            next();
                        }).catch(err => {
                            res.status(401).json(new ApiResponse().setError(this.messages.unauthorized));
                        });
                    }
                });
            }
            next();
        });
    }

    private RegisterJWTController() {
        var mountIndex = 0;
        if ((this.app as any).sessionMiddlewareOffset) {
            mountIndex = (this.app as any).sessionMiddlewareOffset;
        }

        for (var option in this.app.options.security.jwt) {
            this.app.jwtController[option] = this.app.options.security.jwt[option];
        }
        if (!this.app.options.security.jwt.resolveSessionId) {
            this.app.options.security.jwt.resolveSessionId = (payload: any) => new Promise(resolve => resolve(payload.sessionId));
        }

        // Register session id resolver for JWT
        this.app.express.use(async (req, res, next) => {
            try {
                var resolvedToken = req.headers && req.headers["authorization"];
                if (resolvedToken) {
                    if (resolvedToken.startsWith("bearer ")) {
                        resolvedToken = resolvedToken.substring(7);
                    }
                    var args: any = JSON.parse(Buffer.from(resolvedToken.split('.')[1], 'base64').toString("utf8"))
                    var sessionId = await this.app.options.security.jwt.resolveSessionId(args).catch(console.error);
                    if (sessionId) {
                        // Pass the session id to the request
                        (req as any).sessionId = sessionId;
                    }
                }
            } catch (e) {
                this.app.log.error(e);
            }
            next();
        });
        this.RegisterVerify();
    }
    public async CreateToken(req: Request): Promise<string> {
        var payload = await this.createPayload(req, this.app, {}).catch(console.error);
        return jwt.sign(payload, this.secret, {
            ...this.signOptions,
            algorithm: this.algorithm
        });
    }
}