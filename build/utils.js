"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitCallback = exports.precisionRound = void 0;
function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}
exports.precisionRound = precisionRound;
async function waitCallback(_this, action, ...args) {
    return (new Promise((resolve, reject) => {
        action.call(_this, ...args, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    }).catch(console.error));
}
exports.waitCallback = waitCallback;
