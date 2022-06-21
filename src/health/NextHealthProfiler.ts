import { NextApplication } from "..";
import { NextHealthCheckStatus } from "../config/NextOptions";
import { IHealth } from "./IHealth";

export class HealthProfile {
    public name: string;
    public id: string;
    public health: IHealth;
    public status: NextHealthCheckStatus;
}

export class NextHealthProfiler {
    private registry: { name: string, health: IHealth }[] = [];
    constructor() { }
    public register(name: string, health: IHealth) {
        this.registry.push({ name, health });
    }
    public async healthCheck(): Promise<HealthProfile[]> {
        const result: HealthProfile[] = [];
        for (const item of this.registry) {
            const status = await item.health.healthCheck();
            result.push({ name: item.name, id: item.health.constructor && item.health.constructor.name, health: item.health, status });
        }
        return result;
    }
}