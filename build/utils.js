"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInternalIPAddress = exports.formatIP = exports.checkIfValidIPV6 = exports.waitCallback = exports.precisionRound = void 0;
// ? Mathematic
function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}
exports.precisionRound = precisionRound;
// ? Threads
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
// ? Network
function checkIfValidIPV6(str) {
    // Regular expression to check if string is a IPv6 address
    const regexExp = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi;
    return regexExp.test(str);
}
exports.checkIfValidIPV6 = checkIfValidIPV6;
function formatIP(str) {
    if (!str)
        return null;
    if (str === "::1")
        return "127.0.0.1";
    if (str === "::ffff:127.0.0.1" ||
        str === "::ffff::1" ||
        str.startsWith("::ffff"))
        return "127.0.0.1";
    return str;
}
exports.formatIP = formatIP;
function isInternalIPAddress(ip) {
    if (!ip)
        return false;
    if (checkIfValidIPV6(ip)) {
        return ip.startsWith("fe80::") || ip.startsWith("2001:") || ip.startsWith("fc00::");
    }
    else {
        var v4parts = ip.split('.').map(x => parseInt(x));
        if (v4parts[0] === 10)
            return true;
        if (v4parts[0] === 172 && v4parts[1] > 15 && v4parts[1] < 32)
            return true;
        if (v4parts[0] === 192 && v4parts[1] === 168)
            return true;
        return false;
    }
}
exports.isInternalIPAddress = isInternalIPAddress;
