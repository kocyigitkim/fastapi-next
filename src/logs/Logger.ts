import moment from "moment";

const ConsoleLog = console.log;


const ConsoleColors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
}

const logLevels = {
    success: 0,
    info: 1,
    warning: 2,
    error: 3,
    fatal: 4,
    debug: 5,
    trace: 6
}

const log = (message: string, type: string, color: string) => {
    const dt = moment().utc().format("YYYY-MM-DD HH:mm:ss");
    ConsoleLog(`${color}[${dt}] - [${type}] - ${message}${ConsoleColors.Reset}`);
}

export const Logger = {
    info: (message: string) => {
        log(message, "INFO", ConsoleColors.FgBlue);
    },
    warn: (message: string) => {
        log(message, "WARN", ConsoleColors.FgYellow);
    },
    error: (message: string) => {
        log(message, "ERROR", ConsoleColors.FgRed);
    },
    debug: (message: string) => {
        log(message, "DEBUG", ConsoleColors.FgCyan);
    },
    trace: (message: string) => {
        log(message, "TRACE", ConsoleColors.FgMagenta);
    },
    fatal: (message: string) => {
        log(message, "FATAL", ConsoleColors.FgRed);
    },
    success: (message: string) => {
        log(message, "SUCCESS", ConsoleColors.FgGreen);
    },
    log: (message: string) => {
        log(message, "LOG", ConsoleColors.FgWhite);
    }
};