import { EOL } from 'os';
import { PluginConfig } from 'exma';
import { formatCode } from '../../utils';

export default class PluginTransformer {
  //the prisma plugin config
  protected _config: PluginConfig;

  /**
   * Transforms the plugin config to prisma plugin
   */
  static transform(config: PluginConfig) {
    return new PluginTransformer(config).transform();
  }

  /**
   * Just sets the config
   */
  constructor(config: PluginConfig) {
    this._config = config;
  }

  /**
   * Transforms the plugin config to prisma plugin
   */
  db() {
    if (typeof this._config.db !== 'object') {
      return '';
    };
    // plugin "exma-prisma" {
    //   db { provider "cockroachdb" url ["DATABASE_URL"] }
    // }
    const db = this._config.db as Record<string, string>;
    return formatCode(`datasource db {
      ${Object.keys(db).map(key => {
        return Array.isArray(db[key]) 
          ? `${key} = env("${db[key]}")` 
          : `${key} = "${db[key]}"`
      }).join(`${EOL}  `)}
    }`);
  }

  /**
   * Transforms the plugin config to prisma plugin
   */
  transform() {
    return [ ...this.generator(), this.db() ].filter(
      column => column.length > 0
    ).join(EOL + EOL);
  }

  /**
   * Transforms the plugin config to prisma plugin
   */
  generator() {
    if (typeof this._config.generator !== 'object') {
      return [];
    };
    // plugin "exma-prisma" {
    //   generator { client { provider "prisma-client-js" } }
    // }
    const generators = this._config.generator as Record<string, Record<string, any>>;
    return Object.keys(generators).map(name => {
      const config = generators[name];
      
      return formatCode(`generator ${name} {
        ${Object.keys(config).map(key => {
          const value = config[key] as string|string[];
          return Array.isArray(value) 
            ? `${key} = env("${value}")` 
            : `${key} = "${value}"`;
        }).join(`${EOL}  `)}
      }`);
    });
  }
};