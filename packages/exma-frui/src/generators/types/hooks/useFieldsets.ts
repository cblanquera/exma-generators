//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Type from '../../../types/Type';
import { capitalize, formatCode } from '../../../utils';

type Location = Project|Directory;

export default function generateFieldset(project: Location, name: string) {
  const type = new Type(name);
  const capital = capitalize(type.name);
  const typeName = capital;
  
  const path = `types/${type.name.toLowerCase()}/hooks/useFieldsets.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });

  //import type { Line } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ typeName ]
  });

  //export type FieldsetsConfig = { values?: (Line|undefined)[], index: number, set: Function };
  source.addTypeAlias({
    isExported: true,
    name: 'FieldsetsConfig',
    type: `{ values?: (${typeName}|undefined)[], index: number, set: Function }`
  });
  
  //export default function useLineFieldset(config: FieldsetsConfig) {...}
  source.addFunction({
    isDefaultExport: true,
    name: 'useFieldsets',
    parameters: [ { name: 'config', type: 'FieldsetsConfig' } ],
    statements: formatCode(`
      const { values, index, set } = config;
      //handlers
      const handlers = {
        change: (name: string, value: string|number) => {
          const clone = [ ...(values || []) ];
          const current = clone[index] as ${typeName};
          //only if message is different
          if (current[name as '${type.columns.map(column => column.name).join("'|'")}'] !== value) {
            clone[index] = { ...current, [name]: value };
            set(clone);
          }
        },
        remove: () => {
          const newValues = [ ...(values || []) ];
          newValues[index] = undefined;
          set(newValues);
        }
      };
    
      return {value: values?.[index], handlers};
    `)
  });

  source.formatText();
};