import type { SchemaConfig, GeneratorConfig } from 'exma';

import { EOL } from 'os';

import EnumTransformer from './Transformer/EnumTransformer';
import TypeTransformer from './Transformer/TypeTransformer';
import ModelTransformer from './Transformer/ModelTransformer';
import GeneratorTransformer from './Transformer/GeneratorTransformer';

export default class Transformer {
  //the prisma generator config
  protected _config: GeneratorConfig;
  //retainer for the schema instance
  protected _schema: SchemaConfig;

  /**
   * Transforms all schema jsons to a prisma schema
   */
  public static transform(config: GeneratorConfig, schema: SchemaConfig) {
    return new Transformer(config, schema).transform();
  }

  /**
   * Just create and store the selected schema
   */
  constructor(config: GeneratorConfig, schema: SchemaConfig) {
    this._config = config;
    this._schema = schema;
  }

  /**
   * Transforms exma schema to prisma schema
   */
  transform() {
    const output: string[] = [];
    const schema = this._schema;
    const config = this._config as GeneratorConfig;
    const db = config.db as Record<string, string> || {};
    
    output.push(GeneratorTransformer.transform(config));

    if (schema.enum) {
      for (const name in schema.enum) {
        output.push(EnumTransformer.transform(name, schema.enum[name]));
      }
    }
    if (db.provider === 'mongodb' && schema.type) {
      for (const name in schema.type) {
        output.push(TypeTransformer.transform(schema.type[name]));
      }
    }
    if (schema.model) {
      for (const name in schema.model) {
        output.push(ModelTransformer.transform(schema.model[name]));
      }
    }
    return output.join(EOL + EOL);
  }
};