//types
import type { Project, Directory } from 'ts-morph';
import type { SchemaConfig } from 'exma';
//helpers
import Model from '../types/Model';
import { capitalize } from '../utils';

type Location = Project|Directory;

export default function generate(project: Location, schema: SchemaConfig) {
  const models = schema.model || {};
  const path = `index.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  Object.keys(models).forEach(name => {
    const capital = capitalize(name);
    //import ModelDefaultFilters from './models/[model]/components/DefaultFilters'
    source.addImportDeclaration({
      defaultImport: `${capital}DefaultFilters`,
      moduleSpecifier: `./models/${name.toLowerCase()}/components/DefaultFilters`
    });
    //import ModelDefaultForm from './models/[model]/components/DefaultForm'
    source.addImportDeclaration({
      defaultImport: `${capital}DefaultForm`,
      moduleSpecifier: `./models/${name.toLowerCase()}/components/DefaultForm`
    });
    //import ModelDefaultTable from './models/[model]/components/DefaultTable'
    source.addImportDeclaration({
      defaultImport: `${capital}DefaultTable`,
      moduleSpecifier: `./models/${name.toLowerCase()}/components/DefaultTable`
    });
    //import ModelDefaultView from './models/[model]/components/DefaultView'
    source.addImportDeclaration({
      defaultImport: `${capital}DefaultView`,
      moduleSpecifier: `./models/${name.toLowerCase()}/components/DefaultView`
    });
    //import ModelFilterFields from './models/[model]/components/FilterFields'
    source.addImportDeclaration({
      defaultImport: `${capital}FilterFields`,
      moduleSpecifier: `./models/${name.toLowerCase()}/components/FilterFields`
    });
    //import ModelFormFields from './models/[model]/components/FormFields'
    source.addImportDeclaration({
      defaultImport: `${capital}FormFields`,
      moduleSpecifier: `./models/${name.toLowerCase()}/components/FormFields`
    });
    //import ModelListFormats from './models/[model]/components/ListFormats'
    source.addImportDeclaration({
      defaultImport: `${capital}ListFormats`,
      moduleSpecifier: `./models/${name.toLowerCase()}/components/ListFormats`
    });
    //import ModelViewFormats from './models/[model]/components/ViewFormats'
    source.addImportDeclaration({
      defaultImport: `${capital}ViewFormats`,
      moduleSpecifier: `./models/${name.toLowerCase()}/components/ViewFormats`
    });
    //import useModelCreate from './models/[model]/hooks/useCreate'
    source.addImportDeclaration({
      defaultImport: `use${capital}Create`,
      moduleSpecifier: `./models/${name.toLowerCase()}/hooks/useCreate`
    });
    //import useModelRemove from './models/[model]/hooks/useRemove'
    source.addImportDeclaration({
      defaultImport: `use${capital}Remove`,
      moduleSpecifier: `./models/${name.toLowerCase()}/hooks/useRemove`
    });
    //import useModelUpdate from './models/[model]/hooks/useUpdate'
    source.addImportDeclaration({
      defaultImport: `use${capital}Update`,
      moduleSpecifier: `./models/${name.toLowerCase()}/hooks/useUpdate`
    });
    //import useModelSearch from './models/[model]/hooks/useSearch'
    source.addImportDeclaration({
      defaultImport: `use${capital}Search`,
      moduleSpecifier: `./models/${name.toLowerCase()}/hooks/useSearch`
    });
    //import useModelDetail from './models/[model]/hooks/useDetail'
    source.addImportDeclaration({
      defaultImport: `use${capital}Detail`,
      moduleSpecifier: `./models/${name.toLowerCase()}/hooks/useDetail`
    });
    //import validateUser from './models/[model]/validate'
    source.addImportDeclaration({
      defaultImport: `validate${capital}`,
      moduleSpecifier: `./models/${name.toLowerCase()}/validate`
    });
  });
  Object.keys(models).forEach(name => {
    const capital = capitalize(name);
    const model = new Model(name);
    const typeName = capitalize(model.name);
    const extendedName = model.relations.length ? `${typeName}Extended` : typeName;
    
    //export type { User, UserExtended, UserFormResponse, 
    //UserSearchResponse, UserDetailResponse } from './models/[model]/types'
    source.addExportDeclaration({
      namedExports: [
        typeName,
        typeName !== extendedName ? extendedName : '',
        `${capital}FormResponse`,
        `${capital}SearchResponse`,
        `${capital}DetailResponse`
      ].filter(name => name.length > 0),
      moduleSpecifier: `./models/${name.toLowerCase()}/types`,
      isTypeOnly: true
    });
  });
  //export {}
  source.addExportDeclaration({
    namedExports: Object.keys(models).map((name) => [
      `${capitalize(name)}DefaultFilters`,
      `${capitalize(name)}DefaultForm`,
      `${capitalize(name)}DefaultTable`,
      `${capitalize(name)}DefaultView`,
      `${capitalize(name)}FilterFields`,
      `${capitalize(name)}FormFields`,
      `${capitalize(name)}ListFormats`,
      `${capitalize(name)}ViewFormats`,
      `use${capitalize(name)}Create`,
      `use${capitalize(name)}Remove`,
      `use${capitalize(name)}Update`,
      `use${capitalize(name)}Search`,
      `use${capitalize(name)}Detail`,
      `validate${capitalize(name)}`
    ]).flat(1)
  });

  source.formatText();
};