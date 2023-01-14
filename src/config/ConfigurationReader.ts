import { NextApplication } from "../NextApplication";
import path from 'path'
import fs from 'fs'

export enum ConfigurationFileType {
    JSON = "json",
    YAML = "yaml"
}

export class ConfigurationReader {
    public static current: any;
    public static lastUpdated?: Date;
    public static readonly configPath?: string;
    public static configType: ConfigurationFileType = ConfigurationFileType.JSON;
    public static async init() {

        const readConfigFile = () => {
            ConfigurationReader.lastUpdated = new Date();
            try {
                const fileContent = fs.readFileSync(ConfigurationReader.configPath, 'utf8');
                if (ConfigurationReader.configType == ConfigurationFileType.JSON) {
                    ConfigurationReader.current = JSON.parse(fileContent) || {};
                }
                else if (ConfigurationReader.configType == ConfigurationFileType.YAML) {
                    ConfigurationReader.current = require('yaml').parse(fileContent) || {};
                }
            } catch (err) {
                console.error(err);
                ConfigurationReader.current = {};
            }
        };

        fs.watchFile(ConfigurationReader.configPath, (cur, prev) => {
            readConfigFile();
        });

        readConfigFile();
    }
}

(() => {
    (ConfigurationReader as any).configPath = path.join(process.cwd(), "config.json");
})();