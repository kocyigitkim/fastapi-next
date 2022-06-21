import { NextHealthCheckStatus } from "../config/NextOptions";

export interface IHealth {
    healthCheck(): Promise<NextHealthCheckStatus>;
}