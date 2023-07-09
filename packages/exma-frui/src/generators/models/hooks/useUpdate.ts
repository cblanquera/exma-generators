//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../../types/Model';
import { capitalize, camelfy, formatCode } from '../../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const typeName = capitalize(camelfy(model.name));
  const path = `models/${model.name.toLowerCase()}/hooks/useUpdate.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { FormEvent } from 'react';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: 'react',
    namedImports: [ 'FormEvent' ]
  });
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
  //import useForm from '../../../hooks/useForm';
  source.addImportDeclaration({
    moduleSpecifier: '../../../hooks/useForm',
    defaultImport: 'useForm'
  });
  //import validate from '../validate';
  source.addImportDeclaration({
    defaultImport: 'validate',
    moduleSpecifier: `../validate`
  });
  //export default function useUpdate(id: string, method: string, path: string, options: AxiosRequestConfig = {})
  source.addFunction({
    isDefaultExport: true,
    name: 'useUpdate',
    parameters: [
      { name: 'id', type: 'string' },
      { name: 'method', type: 'string' },
      { name: 'path', type: 'string' },
      { name: 'options', type: 'AxiosRequestConfig', initializer: '{}' }
    ],
    statements: formatCode(`
      const action = useFetch<${typeName}>(method, path, options);
      const { input, handlers } = useForm((e: FormEvent) => {
        e.preventDefault();
        if (action.status === 'fetching') {
          return false;
        }
        const errors = validate(input.values, false);
        if (Object.keys(errors).length) {
          action.set({ 
            error: true, 
            code: 400,
            message: 'Invalid Parameters',
            errors: errors
          });
          return false;
        }
        action.call({
          params: { id }, 
          data: input.values
        });
        return false;
      });
      const reset = () => {
        input.set({});
        action.reset();
      };
      return {
        handlers,
        reset,
        input: input.values,
        status: action.status,
        response: action.response
      };
    `)
  });

  source.formatText();
};