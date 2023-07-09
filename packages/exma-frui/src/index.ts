import type { PluginProps } from 'exma';
import { format } from 'prettier';

import fs from 'fs';
import path from 'path';
import { Project, IndentationText, QuoteKind } from 'ts-morph';
import { Loader } from 'exma';

import Enum from './types/Enum';
import Prop from './types/Prop';
import Type from './types/Type';
import Model from './types/Model';

//client generators
import generateClientIndex from './generators/index';
import generateValidator from './generators/Validator';
import generateException from './generators/Exception';
import generateStore from './generators/Store';
import generateHookUseFetch from './generators/hooks/useFetch';
import generateHookUseFilters from './generators/hooks/useFilters';
import generateHookUseForm from './generators/hooks/useForm';
import generateHookUseStripe from './generators/hooks/useStripe';
import generateModelValidate from './generators/models/validate';
import generateModelTypes from './generators/models/types';
import generateModelUseCreate from './generators/models/hooks/useCreate';
import generateModelUseRemove from './generators/models/hooks/useRemove';
import generateModelUseUpdate from './generators/models/hooks/useUpdate';
import generateModelUseSearch from './generators/models/hooks/useSearch';
import generateModelUseDetail from './generators/models/hooks/useDetail';
import generateModelReactDefaultFilters from './generators/models/components/react/DefaultFilters';
import generateModelReactDefaultForm from './generators/models/components/react/DefaultForm';
import generateModelReactDefaultTable from './generators/models/components/react/DefaultTable';
import generateModelReactDefaultView from './generators/models/components/react/DefaultView';
import generateModelTailwindDefaultFilters from './generators/models/components/tailwind/DefaultFilters';
import generateModelTailwindDefaultForm from './generators/models/components/tailwind/DefaultForm';
import generateModelTailwindDefaultTable from './generators/models/components/tailwind/DefaultTable';
import generateModelTailwindDefaultView from './generators/models/components/tailwind/DefaultView';
import generateModelFilterFields from './generators/models/components/FilterFields';
import generateModelFormFields from './generators/models/components/FormFields';
import generateModelListFormats from './generators/models/components/ListFormats';
import generateModelViewFormats from './generators/models/components/ViewFormats';

import generateTypeFormFields from './generators/types/components/FormFields';
import generateTypeListFormats from './generators/types/components/ListFormats';
import generateTypeViewFormats from './generators/types/components/ViewFormats';
import generateTypeReactFieldset from './generators/types/components/react/Fieldset';
import generateTypeReactFieldsets from './generators/types/components/react/Fieldsets';
import generateTypeTailwindFieldset from './generators/types/components/tailwind/Fieldset';
import generateTypeTailwindFieldsets from './generators/types/components/tailwind/Fieldsets';
import generateTypeHooksUseFieldset from './generators/types/hooks/useFieldset';
import generateTypeHooksUseFieldsets from './generators/types/hooks/useFieldsets';
import generateTypeTypes from './generators/types/types';

async function prettify(file: string) {
  fs.writeFileSync(file, await format(
    fs.readFileSync(file, 'utf8'), 
    { 
      parser: 'typescript', 
      printWidth: 80,  // Adjust as needed
      tabWidth: 2,    // Adjust as needed
      useTabs: false, // Adjust as needed
      singleQuote: true
    }
  ));
}

export default function generate({ config, schema, cli }: PluginProps) {
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
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    }
  });

  const directory = project.createDirectory(root);
  generateClientIndex(directory, schema);
  generateValidator(directory);
  generateException(directory);
  generateStore(directory);
  generateHookUseFetch(directory);
  generateHookUseFilters(directory);
  generateHookUseForm(directory);
  generateHookUseStripe(directory);
  for (const model in schema.model) {
    generateModelTypes(directory, typePath, model);
    generateModelValidate(directory, model);

    generateModelUseCreate(directory, model);
    generateModelUseRemove(directory, model);
    generateModelUseUpdate(directory, model);
    generateModelUseSearch(directory, model);
    generateModelUseDetail(directory, model);

    generateModelFilterFields(directory, model, ui);
    generateModelFormFields(directory, model, ui);
    generateModelListFormats(directory, model, ui);
    generateModelViewFormats(directory, model, ui);

    if (ui === 'tailwind') {
      generateModelTailwindDefaultFilters(directory, model);
      generateModelTailwindDefaultForm(directory, model);
      generateModelTailwindDefaultTable(directory, model);
      generateModelTailwindDefaultView(directory, model);
    } else {
      generateModelReactDefaultFilters(directory, model);
      generateModelReactDefaultForm(directory, model);
      generateModelReactDefaultTable(directory, model);
      generateModelReactDefaultView(directory, model);
    }
  }

  for (const type in schema.type) {
    generateTypeTypes(directory, typePath, type);
    generateTypeFormFields(directory, type, ui);
    generateTypeListFormats(directory, type, ui);
    generateTypeViewFormats(directory, type, ui);
    generateTypeHooksUseFieldset(directory, type);
    generateTypeHooksUseFieldsets(directory, type);
    if (ui === 'tailwind') {
      generateTypeTailwindFieldset(directory, type);
      generateTypeTailwindFieldsets(directory, type);
    } else {
      generateTypeReactFieldset(directory, type);
      generateTypeReactFieldsets(directory, type);
    }
  }

  //if you want ts, tsx files
  if (lang == 'ts') {
    project.saveSync();
    prettify(`${root}/index.ts`);
    for (const model in schema.model) {
      prettify(`${root}/models/${model.toLowerCase()}/types.ts`);
      prettify(`${root}/models/${model.toLowerCase()}/validate.ts`);
      prettify(`${root}/models/${model.toLowerCase()}/hooks/useCreate.ts`);
      prettify(`${root}/models/${model.toLowerCase()}/hooks/useDetail.ts`);
      prettify(`${root}/models/${model.toLowerCase()}/hooks/useRemove.ts`);
      prettify(`${root}/models/${model.toLowerCase()}/hooks/useSearch.ts`);
      prettify(`${root}/models/${model.toLowerCase()}/hooks/useUpdate.ts`);
      prettify(`${root}/models/${model.toLowerCase()}/components/DefaultFilters.tsx`);
      prettify(`${root}/models/${model.toLowerCase()}/components/DefaultForm.tsx`);
      prettify(`${root}/models/${model.toLowerCase()}/components/DefaultTable.tsx`);
      prettify(`${root}/models/${model.toLowerCase()}/components/DefaultView.tsx`);
      prettify(`${root}/models/${model.toLowerCase()}/components/FilterFields.tsx`);
      prettify(`${root}/models/${model.toLowerCase()}/components/FormFields.tsx`);
      prettify(`${root}/models/${model.toLowerCase()}/components/ListFormats.tsx`);
      prettify(`${root}/models/${model.toLowerCase()}/components/ViewFormats.tsx`);
    }

    for (const type in schema.type) {
      prettify(`${root}/types/${type.toLowerCase()}/types.ts`);
      prettify(`${root}/types/${type.toLowerCase()}/components/Fieldset.tsx`);
      prettify(`${root}/types/${type.toLowerCase()}/components/Fieldsets.tsx`);
      prettify(`${root}/types/${type.toLowerCase()}/components/FormFields.tsx`);
      prettify(`${root}/types/${type.toLowerCase()}/components/ListFormats.tsx`);
      prettify(`${root}/types/${type.toLowerCase()}/components/ViewFormats.tsx`);
      prettify(`${root}/types/${type.toLowerCase()}/hooks/useFieldset.ts`);
      prettify(`${root}/types/${type.toLowerCase()}/hooks/useFieldsets.ts`);
    }
    
  //if you want js, d.ts files
  } else {
    project.emit();
  }
};