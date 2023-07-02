import type { GeneratorProps } from 'exma';

import path from 'path';
import { Project, IndentationText } from 'ts-morph';
import { Loader } from 'exma';

//client generators
import generateClientIndex from './generators/index';
import generateClientValidate from './generators/validate';
import generateClientTypes from './generators/types';
import generateUseCreate from './generators/hooks/useCreate';
import generateUseRemove from './generators/hooks/useRemove';
import generateUseUpdate from './generators/hooks/useUpdate';
import generateUseSearch from './generators/hooks/useSearch';
import generateUseDetail from './generators/hooks/useDetail';
import generateReactDefaultFilters from './generators/components/react/DefaultFilters';
import generateReactDefaultForm from './generators/components/react/DefaultForm';
import generatereactDefaultTable from './generators/components/react/DefaultTable';
import generateReactDefaultView from './generators/components/react/DefaultView';
import generateTailwindDefaultFilters from './generators/components/tailwind/DefaultFilters';
import generateTailwindDefaultForm from './generators/components/tailwind/DefaultForm';
import generateTailwindDefaultTable from './generators/components/tailwind/DefaultTable';
import generateTailwindDefaultView from './generators/components/tailwind/DefaultView';
import generateFilterFields from './generators/components/FilterFields';
import generateFormFields from './generators/components/FormFields';
import generateListFormats from './generators/components/ListFormats';
import generateViewFormats from './generators/components/ViewFormats';

export default function generate({ config, schema, cli }: GeneratorProps) {
  if (!config.output) {
    return cli.terminal.error('No output directory specified');
  }

  const ui = config.ui || 'react';
  const lang = config.lang || 'ts';
  const root = Loader.absolute(config.output);
  const models = schema.model;
  
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
  generateClientIndex(directory, models);
  for (const name in models) {
    generateClientTypes(directory, models[name], models);
    generateClientValidate(directory, models[name]);

    generateUseCreate(directory, models[name]);
    generateUseRemove(directory, models[name]);
    generateUseUpdate(directory, models[name]);
    generateUseSearch(directory, models[name]);
    generateUseDetail(directory, models[name]);

    generateFilterFields(directory, models[name], ui);
    generateFormFields(directory, models[name], ui);
    generateListFormats(directory, models[name], ui);
    generateViewFormats(directory, models[name], ui);

    if (ui === 'tailwind') {
      generateTailwindDefaultFilters(directory, models[name]);
      generateTailwindDefaultForm(directory, models[name]);
      generateTailwindDefaultTable(directory, models[name]);
      generateTailwindDefaultView(directory, models[name]);
    } else {
      generateReactDefaultFilters(directory, models[name]);
      generateReactDefaultForm(directory, models[name]);
      generatereactDefaultTable(directory, models[name]);
      generateReactDefaultView(directory, models[name]);
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