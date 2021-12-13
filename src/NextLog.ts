export class NextLog {
    public log(message: string) { }
    public error(message: string) { }
    public warn(message: string) { }
    public info(message: string) { this.log(message); }
    public debug(message: string) { this.log(message); }
    public trace(message: string) { this.log(message); }
}
export class NextConsoleLog extends NextLog {
    public log(message: string) { console.log(message); }
    public error(message: string) { console.error(message); }
    public warn(message: string) { console.warn(message); }
}