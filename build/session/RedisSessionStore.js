"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisSessionStore = void 0;
const ISessionStore_1 = require("./ISessionStore");
const connect_redis_1 = __importDefault(require("connect-redis"));
const redis_1 = __importDefault(require("redis"));
const noop = () => { };
class RedisSessionStore extends ISessionStore_1.ISessionStore {
    constructor(config) {
        super();
        this.config = config;
        var redisStore = (0, connect_redis_1.default)({ Store: ISessionStore_1.ISessionStore });
        this.init = this.init.bind(this);
        var store = new redisStore({ client: redis_1.default.createClient(config) });
        this.store = store;
    }
}
exports.RedisSessionStore = RedisSessionStore;
