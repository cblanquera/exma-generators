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
  
  const path = `types/${type.name.toLowerCase()}/hooks/useFieldset.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });

  //import type { Item } from "../types";
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ typeName ]
  });
  
  //export type FieldsetProps = { value?: Item, set: Function };
  source.addTypeAlias({
    isExported: true,
    name: 'FieldsetProps',
    type: `{ value?: ${typeName}, set: Function }`
  });
  
  //export default function useFieldset(config: FieldsetProps) {...}
  source.addFunction({
    isDefaultExport: true,
    name: 'useFieldset',
    parameters: [ { name: 'config', type: 'FieldsetProps' } ],
    statements: formatCode(`
      const { value, set } = config;
      //handlers
      const handlers = {
        change: (name: string, newValue: string | number) => {
          const current = { ...value };
          //only if value is different
          if (current[name] !== newValue) {
            set({ ...value, [name]: value });
          }
        }
      };
    
      return { value, handlers };
    `)
  });

  source.formatText();
};