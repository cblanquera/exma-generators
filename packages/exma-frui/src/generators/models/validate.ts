//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../types/Model';
import { capitalize, formatCode } from '../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const path = `models/${model.name.toLowerCase()}/validate.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { User } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: './types',
    namedImports: [ capitalize(model.name) ]
  });
  //import Validator from '../Validator'
  source.addImportDeclaration({
    defaultImport: 'Validator',
    moduleSpecifier: '../../Validator'
  });
  //export default function validate(data: Partial<ModelType>)
  source.addFunction({
    isDefaultExport: true,
    name: 'validate',
    parameters: [
      { name: 'data', type: `Partial<${capitalize(model.name)}>` },
      { name: 'strict', initializer: 'true' }
    ],
    statements: formatCode(`
      const errors: Record<string, string> = {};
      ${model.columns.map(column => column.validators.map(validator => {
        const required = validator.method === 'required';
        const method = `Validator.${validator.method}`;
        const precheck = required 
          ? 'strict && '
          : `Validator.isset(data.${column.name}) && `;
        const parameters = [ 
          `data.${column.name}`,
          ...validator.parameters.map(arg => JSON.stringify(arg))
        ];
        return (`
          if (${precheck}!${method}(${parameters.join(', ')})) {
            errors.${column.name} = '${validator.message}';
          }
        `)
      }).join(' else ')).join('\n')}
      return errors;
    `)
  });

  source.formatText();
};