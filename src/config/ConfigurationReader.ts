import { NextApplication } from "../NextApplication";
import path from 'path'
import fs from 'fs'

export enum ConfigurationFileType {
    JSON = "json",
    YAML = "yaml"
}

export enum ConfigurationSourceType {
    FILE = "file",
    ENV = "env",
    VAULT = "vault"
}

export interface VaultConfig {
    endpoint: string;
    token?: string;
    namespace?: string;
    mount?: string;
    path?: string;
    secretVersion?: number;
}

export class ConfigurationReader {
    public static current: any;
    public static lastUpdated?: Date;
    public static configPath?: string;
    public static configType: ConfigurationFileType = ConfigurationFileType.JSON;
    public static sourceType: ConfigurationSourceType = ConfigurationSourceType.FILE;
    public static vaultConfig?: VaultConfig;
    public static envPrefix: string = "APP_";

    public static async init() {
        if (ConfigurationReader.sourceType === ConfigurationSourceType.FILE) {
            await ConfigurationReader.initFromFile();
        } else if (ConfigurationReader.sourceType === ConfigurationSourceType.ENV) {
            await ConfigurationReader.initFromEnv();
        } else if (ConfigurationReader.sourceType === ConfigurationSourceType.VAULT) {
            await ConfigurationReader.initFromVault();
        }
    }

    private static async initFromFile() {
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
        try {
            fs.watchFile(ConfigurationReader.configPath, (cur, prev) => {
                readConfigFile();
            });
        } catch (err) {
            console.error("Error watching config file:", err);
        }
        readConfigFile();
    }

    private static async initFromEnv() {
        ConfigurationReader.lastUpdated = new Date();
        try {
            const envConfig: Record<string, any> = {};
            for (const key in process.env) {
                if (key.startsWith(ConfigurationReader.envPrefix)) {
                    const configKey = key.substring(ConfigurationReader.envPrefix.length).toLowerCase();
                    let configValue: any = process.env[key];

                    // Try to parse as JSON if it looks like JSON
                    if (configValue?.startsWith('{') || configValue?.startsWith('[')) {
                        try {
                            configValue = JSON.parse(configValue);
                        } catch (e) {
                            // If parsing fails, keep as string
                        }
                    }

                    // Convert to appropriate type
                    if (configValue === 'true') configValue = true;
                    else if (configValue === 'false') configValue = false;
                    else if (!isNaN(Number(configValue)) && configValue?.trim() !== '') configValue = Number(configValue);

                    // Support nested keys using dot notation
                    const parts = configKey.split('.');
                    let current: Record<string, any> = envConfig;
                    for (let i = 0; i < parts.length - 1; i++) {
                        const part = parts[i];
                        if (!current[part]) current[part] = {};
                        current = current[part];
                    }
                    current[parts[parts.length - 1]] = configValue;
                }
            }
            ConfigurationReader.current = envConfig;
        } catch (err) {
            console.error('Error loading configuration from environment variables:', err);
            ConfigurationReader.current = {};
        }
    }

    private static async initFromVault() {
        ConfigurationReader.lastUpdated = new Date();
        try {
            // Load vault client only when needed
            const vaultConfig = ConfigurationReader.resolveVaultConfig();

            if (!vaultConfig.endpoint) {
                throw new Error("Vault endpoint is required for Vault configuration source");
            }

            // Dynamic import of node-vault package
            const vault = require('node-vault')({
                endpoint: vaultConfig.endpoint,
                token: vaultConfig.token,
                namespace: vaultConfig.namespace
            });

            const mount = vaultConfig.mount || 'secret';
            const path = vaultConfig.path || 'data';
            const version = vaultConfig.secretVersion;

            let response;
            if (version) {
                // KV v2
                response = await vault.read(`${mount}/data/${path}`, { version });
                ConfigurationReader.current = response.data.data;
            } else {
                // KV v1 or auto-detect
                try {
                    // Try KV v2 first
                    response = await vault.read(`${mount}/data/${path}`);
                    ConfigurationReader.current = response.data.data;
                } catch (error) {
                    // Fall back to KV v1
                    response = await vault.read(`${mount}/${path}`);
                    ConfigurationReader.current = response.data;
                }
            }

        } catch (err) {
            console.error('Error loading configuration from Vault:', err);
            ConfigurationReader.current = {};
        }
    }

    private static resolveVaultConfig(): VaultConfig {
        // If explicit config is provided, use it
        if (ConfigurationReader.vaultConfig) {
            return ConfigurationReader.vaultConfig;
        }

        // Otherwise, try to get from environment variables
        return {
            endpoint: process.env.VAULT_ADDR || '',
            token: process.env.VAULT_TOKEN,
            namespace: process.env.VAULT_NAMESPACE,
            mount: process.env.VAULT_MOUNT || 'secret',
            path: process.env.VAULT_PATH || 'application',
            secretVersion: process.env.VAULT_SECRET_VERSION ? parseInt(process.env.VAULT_SECRET_VERSION) : undefined
        };
    }

    public static setVaultConfig(config: VaultConfig) {
        ConfigurationReader.vaultConfig = config;
        ConfigurationReader.sourceType = ConfigurationSourceType.VAULT;
    }

    public static useEnvironmentVariables(prefix?: string) {
        if (prefix) {
            ConfigurationReader.envPrefix = prefix;
        }
        ConfigurationReader.sourceType = ConfigurationSourceType.ENV;
    }

    public static useFileConfig(filePath?: string, fileType?: ConfigurationFileType) {
        if (filePath) {
            ConfigurationReader.configPath = filePath;
        }
        if (fileType) {
            ConfigurationReader.configType = fileType;
        }
        ConfigurationReader.sourceType = ConfigurationSourceType.FILE;
    }
}

(() => {
    (ConfigurationReader as any).configPath = path.join(process.cwd(), "config.json");
})();