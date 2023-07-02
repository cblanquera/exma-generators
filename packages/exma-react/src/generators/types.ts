//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../types/Model';
import { 
  capitalize, 
  getTypeName, 
  getTypeExtendedName,
  formatCode
} from '../utils';

//types: string, text, string[], number, integer, 
//       float, boolean, date, object, hash, hash[]
const map: Record<string, string> = {
  'string': 'string',
  'text': 'string',
  'string[]': 'string[]',
  'number': 'number',
  'integer': 'number',
  'float': 'number',
  'boolean': 'boolean',
  'date': 'Date',
  'object': 'Record<string, any>',
  'hash': 'Record<string, string|number|boolean|null>',
  'hash[]': 'Record<string, string|number|boolean|null>[]'
};

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const capital = capitalize(model.name);
  const typeName = getTypeName(model);
  const typeExtendedName = getTypeExtendedName(model);

  const path = `model/${model.name}/types.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { APIResponse } from 'inceptjs';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: 'inceptjs',
    namedImports: [ 'APIResponse' ]
  });

  model.relations.forEach(column => {
    const relation = column.relation as { model: string, column: string };
    //import type { Model2TypeExtended } from '../model2/types';
    source.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: `../${relation.model}/types`,
      namedImports: [ getTypeExtendedName(new Model(relation.model)) ]
    });
  });
  //export type ModelType
  source.addTypeAlias({
    isExported: true,
    name: typeName,
    type: formatCode(`{
      ${model.columns.map(column => (
        `${column.name}${!column.required ? '?' : ''}: ${map[column.type] || column.type}`
      )).join(',\n')}
    }`)
  });
  if (typeName !== typeExtendedName) {
    //export type ModelTypeExtended
    source.addTypeAlias({
      isExported: true,
      name: typeExtendedName,
      type: formatCode(`${typeName} & {
        ${model.relations.map(column => {
          const relation = column.relation as { model: string, column: string };
          return `${relation.model}${!column.required ? '?' : ''}: ${getTypeExtendedName(new Model(relation.model))}`
        }).join(',\n')}
      }`)
    });
  }
  
  //export type ModelFormResponse = APIResponse<ModelType>
  source.addTypeAlias({
    isExported: true,
    name: `${capital}FormResponse`,
    type: `APIResponse<${typeName}>`
  });
  //export type ModelDetailResponse = APIResponse<ModelTypeExtended>
  source.addTypeAlias({
    isExported: true,
    name: `${capital}DetailResponse`,
    type: `APIResponse<${typeExtendedName}>`
  });
  //export type ModelSearchResponse = APIResponse<ModelTypeExtended[]>
  source.addTypeAlias({
    isExported: true,
    name: `${capital}SearchResponse`,
    type: `APIResponse<${typeExtendedName}[]>`
  });
};