import path from "path";

// ? Mathematic
export function precisionRound(number: number, precision: number) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}
// ? Threads
export async function waitCallback<T>(_this: T, action, ...args): Promise<T> {
    return (new Promise((resolve, reject) => {
        action.call(_this, ...args, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    }).catch(console.error)) as Promise<T>;
}

// ? Network
export function checkIfValidIPV6(str) {
    // Regular expression to check if string is a IPv6 address
    const regexExp = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi;

    return regexExp.test(str);
}
export function formatIP(str) {
    if (!str) return null;

    if (str === "::1") return "127.0.0.1";
    if (
        str === "::ffff:127.0.0.1" ||
        str === "::ffff::1" ||
        str.startsWith("::ffff")) return "127.0.0.1";

    return str;
}

export function isInternalIPAddress(ip: string) {
    if (!ip) return false;
    if (checkIfValidIPV6(ip)) {
        return ip.startsWith("fe80::") || ip.startsWith("2001:") || ip.startsWith("fc00::");
    }
    else {
        var v4parts = ip.split('.').map(x => parseInt(x));
        if (v4parts[0] === 10) return true;
        if (v4parts[0] === 172 && v4parts[1] > 15 && v4parts[1] < 32) return true;
        if (v4parts[0] === 192 && v4parts[1] === 168) return true;
        return false;
    }
}

export function getTokenFromHeader(header: string) {
    if (header && header.startsWith('Bearer ')) {
        return header.slice(7, header.length);
    }
    return null;
}
export function normalizeUrlPath(path: string) {
    return path.replace(/\/+/g, "/").replace(/(^\/)|(\/$)/g, "");
}
export function checkPathsByNormalization(path1: string, path2: string) {
    path1 = path.normalize(path1);
    path2 = path.normalize(path2);
    return path1 === path2;
}
export function makeType(type: any, args){
    var t = new type();
    for (var key in args) {
        t[key] = args[key];
    }
    return t;
}