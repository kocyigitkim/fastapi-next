import { NextAuthenticationMethod } from "../NextAuthenticationMethod";

export class NextAuthenticationMethodRegistry {
    private static methods: NextAuthenticationMethod[] = [];
    public static register(method: any) {
        this.methods.push(method);
    }
    public static get(name: string): NextAuthenticationMethod | undefined {
        return this.methods.find(m => (m as any).methodName == name);
    }
    public static getAll(): NextAuthenticationMethod[] {
        return [...this.methods];
    }
    public static make<T=any>(name: string | T, args: any) : any {
        if (typeof name == 'function') {
            var instance = new (name as any)();
            if (args) {
                for (var key in args) {
                    instance[key] = args[key];
                }
            }
            return instance;
        }
        else {
            var constructor = this.get(name as any).constructor as any;
            var instance = new constructor();
            if (args) {
                for (var key in args) {
                    instance[key] = args[key];
                }
            }
            return instance;
        }
        return undefined;
    }
}