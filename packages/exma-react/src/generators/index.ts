//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../types/Model';
import { capitalize, getTypeName, getTypeExtendedName } from '../utils';

type Location = Project|Directory;

export default function generate(project: Location) {
  const models = Model.configs;
  const path = `index.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  Object.keys(models).forEach((name) => {
    const capital = capitalize(name);
    //import ModelDefaultFilters from './model/[model]/components/DefaultFilters'
    source.addImportDeclaration({
      defaultImport: `${capital}DefaultFilters`,
      moduleSpecifier: `./model/${name}/components/DefaultFilters`
    });
    //import ModelDefaultForm from './model/[model]/components/DefaultForm'
    source.addImportDeclaration({
      defaultImport: `${capital}DefaultForm`,
      moduleSpecifier: `./model/${name}/components/DefaultForm`
    });
    //import ModelDefaultTable from './model/[model]/components/DefaultTable'
    source.addImportDeclaration({
      defaultImport: `${capital}DefaultTable`,
      moduleSpecifier: `./model/${name}/components/DefaultTable`
    });
    //import ModelDefaultView from './model/[model]/components/DefaultView'
    source.addImportDeclaration({
      defaultImport: `${capital}DefaultView`,
      moduleSpecifier: `./model/${name}/components/DefaultView`
    });
    //import ModelFilterFields from './model/[model]/components/FilterFields'
    source.addImportDeclaration({
      defaultImport: `${capital}FilterFields`,
      moduleSpecifier: `./model/${name}/components/FilterFields`
    });
    //import ModelFormFields from './model/[model]/components/FormFields'
    source.addImportDeclaration({
      defaultImport: `${capital}FormFields`,
      moduleSpecifier: `./model/${name}/components/FormFields`
    });
    //import ModelListFormats from './model/[model]/components/ListFormats'
    source.addImportDeclaration({
      defaultImport: `${capital}ListFormats`,
      moduleSpecifier: `./model/${name}/components/ListFormats`
    });
    //import ModelViewFormats from './model/[model]/components/ViewFormats'
    source.addImportDeclaration({
      defaultImport: `${capital}ViewFormats`,
      moduleSpecifier: `./model/${name}/components/ViewFormats`
    });
    //import useModelCreate from './model/[model]/hooks/useCreate'
    source.addImportDeclaration({
      defaultImport: `use${capital}Create`,
      moduleSpecifier: `./model/${name}/hooks/useCreate`
    });
    //import useModelRemove from './model/[model]/hooks/useRemove'
    source.addImportDeclaration({
      defaultImport: `use${capital}Remove`,
      moduleSpecifier: `./model/${name}/hooks/useRemove`
    });
    //import useModelUpdate from './model/[model]/hooks/useUpdate'
    source.addImportDeclaration({
      defaultImport: `use${capital}Update`,
      moduleSpecifier: `./model/${name}/hooks/useUpdate`
    });
    //import useModelSearch from './model/[model]/hooks/useSearch'
    source.addImportDeclaration({
      defaultImport: `use${capital}Search`,
      moduleSpecifier: `./model/${name}/hooks/useSearch`
    });
    //import useModelDetail from './model/[model]/hooks/useDetail'
    source.addImportDeclaration({
      defaultImport: `use${capital}Detail`,
      moduleSpecifier: `./model/${name}/hooks/useDetail`
    });
    //import validateUser from './model/[model]/validate'
    source.addImportDeclaration({
      defaultImport: `validate${capital}`,
      moduleSpecifier: `./model/${name}/validate`
    });
  });
  Object.keys(models).forEach(name => {
    const capital = capitalize(name);
    const typeName = getTypeName(new Model(name));
    const typeExtendedName = getTypeExtendedName(new Model(name));
    //export type { ModelType, ModelTypeExtended, ModelFormResponse, 
    //ModelSearchResponse, ModelDetailResponse } from './model/[model]/types'
    source.addExportDeclaration({
      namedExports: [
        typeName,
        typeName !== typeExtendedName ? typeExtendedName : '',
        `${capital}FormResponse`,
        `${capital}SearchResponse`,
        `${capital}DetailResponse`
      ].filter(name => name.length > 0),
      moduleSpecifier: `./model/${name}/types`,
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
};