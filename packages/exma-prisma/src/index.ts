import type { GeneratorProps } from 'exma';

import fs from 'fs';
import { Loader } from 'exma';
import Enum from './types/Enum';
import Type from './types/Type';
import Model from './types/Model';
import Transformer from './types/Transformer';

export default function generate({ config, schema, cli }: GeneratorProps) {
  if (!config.output) {
    return cli.terminal.error('No output directory specified');
  }
  
  //load up the configs
  if (schema.enum && typeof schema.enum === 'object' && !Array.isArray(schema.enum)) {
    const enums = schema.enum;
    Object.keys(enums).forEach(name => {
      Enum.add(name, enums[name]);
    });
  }
  if (schema.type && typeof schema.type === 'object' && !Array.isArray(schema.type)) {
    const types = schema.type;
    Object.keys(types).forEach(name => {
      Type.add(types[name]);
    });
  }
  if (schema.model && typeof schema.model === 'object' && !Array.isArray(schema.model)) {
    const models = schema.model;
    Object.keys(models).forEach(name => {
      Model.add(models[name]);
    });
  }

  fs.writeFileSync(
    Loader.absolute(config.output as string), 
    Transformer.transform(config, schema)
  );
};