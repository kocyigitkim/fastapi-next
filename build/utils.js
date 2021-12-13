"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precisionRound = void 0;
function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}
exports.precisionRound = precisionRound;
