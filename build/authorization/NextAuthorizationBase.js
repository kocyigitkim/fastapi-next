"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextAuthorizationBase = void 0;
class NextAuthorizationBase {
    async check(ctx, permission) {
        return true;
    }
    async init() {
    }
}
exports.NextAuthorizationBase = NextAuthorizationBase;
