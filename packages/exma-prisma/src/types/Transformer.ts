import type { SchemaConfig, PluginConfig } from 'exma';

import { EOL } from 'os';

import EnumTransformer from './Transformer/EnumTransformer';
import TypeTransformer from './Transformer/TypeTransformer';
import ModelTransformer from './Transformer/ModelTransformer';
import PluginTransformer from './Transformer/PluginTransformer';

export default class Transformer {
  //the prisma plugin config
  protected _config: PluginConfig;
  //retainer for the schema instance
  protected _schema: SchemaConfig;

  /**
   * Transforms all schema jsons to a prisma schema
   */
  public static transform(config: PluginConfig, schema: SchemaConfig) {
    return new Transformer(config, schema).transform();
  }

  /**
   * Just create and store the selected schema
   */
  constructor(config: PluginConfig, schema: SchemaConfig) {
    this._config = config;
    this._schema = schema;
  }

  /**
   * Transforms exma schema to prisma schema
   */
  transform() {
    const output: string[] = [];
    const schema = this._schema;
    const config = this._config as PluginConfig;
    const db = config.db as Record<string, string> || {};
    
    output.push(PluginTransformer.transform(config));

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