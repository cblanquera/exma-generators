//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../types/Model';
import { capitalize } from '../../utils';

type Location = Project|Directory;

export default function generate(project: Location, typePath: string, name: string) {
  const model = new Model(name);
  const capital = capitalize(model.name);
  const typeName = capital;
  const typeExtendedName = model.relations.length ? `${typeName}Extended` : typeName;
  const types = [ typeName, typeExtendedName ].filter(
    //filter unqiue names
    (value, index, array) => array.indexOf(value) === index
  );

  const path = `models/${model.name.toLowerCase()}/types.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { APIResponse } from '../../hooks/useFetch';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../../hooks/useFetch',
    namedImports: [ 'APIResponse' ]
  });

  //import type { User, UserExtended } from '../../../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: `../../${typePath}`,
    namedImports: types
  });

  //export type { User, UserExtended }
  source.addExportDeclaration({
    namedExports: types,
    isTypeOnly: true
  });
  
  //export type UserFormResponse = APIResponse<User>
  source.addTypeAlias({
    isExported: true,
    name: `${capital}FormResponse`,
    type: `APIResponse<${typeName}>`
  });
  //export type UserDetailResponse = APIResponse<UserExtended>
  source.addTypeAlias({
    isExported: true,
    name: `${capital}DetailResponse`,
    type: `APIResponse<${typeExtendedName}>`
  });
  //export type UserSearchResponse = APIResponse<UserExtended[]>
  source.addTypeAlias({
    isExported: true,
    name: `${capital}SearchResponse`,
    type: `APIResponse<${typeExtendedName}[]>`
  });

  source.formatText();
};