//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../../types/Model';
import { capitalize, camelfy, formatCode } from '../../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const typeName = capitalize(camelfy(model.name));;
  const path = `models/${model.name.toLowerCase()}/hooks/useRemove.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { AxiosRequestConfig } from 'axios';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: 'axios',
    namedImports: [ 'AxiosRequestConfig' ]
  });
  //import type { User } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ typeName ]
  });
  //import useFetch from '../../../hooks/useFetch';
  source.addImportDeclaration({
    moduleSpecifier: '../../../hooks/useFetch',
    defaultImport: 'useFetch'
  });
  //export default function useRemove(id: string, method: string, path: string, options: AxiosRequestConfig = {})
  source.addFunction({
    isDefaultExport: true,
    name: 'useRemove',
    parameters: [
      { name: 'id', type: 'string' },
      { name: 'method', type: 'string' },
      { name: 'path', type: 'string' },
      { name: 'options', type: 'AxiosRequestConfig', initializer: '{}' }
    ],
    statements: formatCode(`
      const action = useFetch<${typeName}>(method, path, options);
      const handlers = {
        send() {
          if (action.status === 'fetching') return false;
          action.call({ params: { id } });
        }
      };
      return {
        handlers, 
        reset: action.reset,
        status: action.status,
        response: action.response
      };
    `)
  });

  source.formatText();
};