"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextKnexPlugin = void 0;
const knex_1 = __importDefault(require("knex"));
const NextPlugin_1 = require("./NextPlugin");
class NextKnexPlugin extends NextPlugin_1.NextPlugin {
    constructor(config) {
        super("db", true);
        this.config = config;
        this.knex = (0, knex_1.default)(config);
    }
    async init(app) {
        app.log.info("Knex plugin loaded");
    }
    async retrieve(next) {
        return this.knex;
    }
}
exports.NextKnexPlugin = NextKnexPlugin;
