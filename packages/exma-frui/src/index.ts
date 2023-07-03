import type { GeneratorProps } from 'exma';

import path from 'path';
import { Project, IndentationText } from 'ts-morph';
import { Loader } from 'exma';

import Enum from './types/Enum';
import Prop from './types/Prop';
import Type from './types/Model';
import Model from './types/Model';

//client generators
import generateClientIndex from './generators/index';
import generateTypeValidator from './generators/types/Validator';
import generateHookUseFetch from './generators/hooks/useFetch';
import generateHookUseFilters from './generators/hooks/useFilters';
import generateHookUseForm from './generators/hooks/useForm';
import generateHookUseStripe from './generators/hooks/useStripe';
import generateClientValidate from './generators/models/validate';
import generateClientTypes from './generators/models/types';
import generateUseCreate from './generators/models/hooks/useCreate';
import generateUseRemove from './generators/models/hooks/useRemove';
import generateUseUpdate from './generators/models/hooks/useUpdate';
import generateUseSearch from './generators/models/hooks/useSearch';
import generateUseDetail from './generators/models/hooks/useDetail';
import generateReactDefaultFilters from './generators/models/components/react/DefaultFilters';
import generateReactDefaultForm from './generators/models/components/react/DefaultForm';
import generatereactDefaultTable from './generators/models/components/react/DefaultTable';
import generateReactDefaultView from './generators/models/components/react/DefaultView';
import generateTailwindDefaultFilters from './generators/models/components/tailwind/DefaultFilters';
import generateTailwindDefaultForm from './generators/models/components/tailwind/DefaultForm';
import generateTailwindDefaultTable from './generators/models/components/tailwind/DefaultTable';
import generateTailwindDefaultView from './generators/models/components/tailwind/DefaultView';
import generateFilterFields from './generators/models/components/FilterFields';
import generateFormFields from './generators/models/components/FormFields';
import generateListFormats from './generators/models/components/ListFormats';
import generateViewFormats from './generators/models/components/ViewFormats';

export default function generate({ config, schema, cli }: GeneratorProps) {
  if (!config.output) {
    return cli.terminal.error('No output directory specified');
  }
  if (!config.types) {
    return cli.terminal.error('No types file specified');
  }

  //load up the configs
  if (schema.enum && typeof schema.enum === 'object' && !Array.isArray(schema.enum)) {
    const enums = schema.enum;
    Object.keys(enums).forEach(name => {
      Enum.add(name, enums[name]);
    });
  }
  if (schema.prop && typeof schema.prop === 'object' && !Array.isArray(schema.prop)) {
    const props = schema.prop;
    Object.keys(props).forEach(name => {
      Prop.add(name, props[name]);
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

  const ui = config.ui as string || 'react';
  const lang = config.lang || 'ts';
  const root = Loader.absolute(config.output as string);

  const types = Loader.absolute(config.types as string);
  const typeDir = path.relative(root, path.dirname(types));
  const typePath = path.join(typeDir, path.basename(types, '.ts'));
  
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      outDir: root,
      declaration: true, // Generates corresponding '.d.ts' file.
      declarationMap: true, // Generates a sourcemap for each corresponding '.d.ts' file.
      sourceMap: true, // Generates corresponding '.map' file.
    },
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces
    }
  });

  const directory = project.createDirectory(root);
  generateClientIndex(directory, schema);
  generateTypeValidator(directory);
  generateHookUseFetch(directory);
  generateHookUseFilters(directory);
  generateHookUseForm(directory);
  generateHookUseStripe(directory);
  for (const model in schema.model) {
    generateClientTypes(directory, typePath, model);
    generateClientValidate(directory, model);

    generateUseCreate(directory, model);
    generateUseRemove(directory, model);
    generateUseUpdate(directory, model);
    generateUseSearch(directory, model);
    generateUseDetail(directory, model);

    generateFilterFields(directory, model, ui);
    generateFormFields(directory, model, ui);
    generateListFormats(directory, model, ui);
    generateViewFormats(directory, model, ui);

    if (ui === 'tailwind') {
      generateTailwindDefaultFilters(directory, model);
      generateTailwindDefaultForm(directory, model);
      generateTailwindDefaultTable(directory, model);
      generateTailwindDefaultView(directory, model);
    } else {
      generateReactDefaultFilters(directory, model);
      generateReactDefaultForm(directory, model);
      generatereactDefaultTable(directory, model);
      generateReactDefaultView(directory, model);
    }
  }

  //if you want ts, tsx files
  if (lang == 'ts') {
    project.saveSync();
  //if you want js, d.ts files
  } else {
    project.emit();
  }
};