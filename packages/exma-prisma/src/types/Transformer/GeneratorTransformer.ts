import { EOL } from 'os';
import { GeneratorConfig } from 'exma';
import { formatCode } from '../../utils';

export default class GeneratorTransformer {
  //the prisma generator config
  protected _config: GeneratorConfig;

  /**
   * Transforms the generator config to prisma generator
   */
  static transform(config: GeneratorConfig) {
    return new GeneratorTransformer(config).transform();
  }

  /**
   * Just sets the config
   */
  constructor(config: GeneratorConfig) {
    this._config = config;
  }

  /**
   * Transforms the generator config to prisma generator
   */
  transform() {
    return [ ...this.generator(), this.db() ].filter(
      column => column.length > 0
    ).join(EOL + EOL);
  }

  /**
   * Transforms the generator config to prisma generator
   */
  generator() {
    if (typeof this._config.generator !== 'object') {
      return [];
    };
    // generator "exma-prisma" {
    //   generator { client { provider "prisma-client-js" } }
    // }
    const generators = this._config.generator as Record<string, Record<string, any>>;
    return Object.keys(generators).map(generatorName => {
      const config = generators[generatorName];
      
      return formatCode(`generator ${generatorName} {
        ${Object.keys(config).map(key => {
          const value = config[key] as string|string[];
          return Array.isArray(value) 
            ? `${key} = env("${value}")` 
            : `${key} = "${value}"`;
        }).join(`${EOL}  `)}
      }`);
    });
  }

  /**
   * Transforms the generator config to prisma generator
   */
  db() {
    if (typeof this._config.db !== 'object') {
      return '';
    };
    // generator "exma-prisma" {
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
};