//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../../types/Model';
import { capitalize } from '../../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const typeName = capitalize(model.name);
  const extendedName = model.relations.length ? `${typeName}Extended` : typeName;
  const path = `models/${model.name.toLowerCase()}/hooks/useDetail.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { AxiosRequestConfig } from 'axios';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: 'axios',
    namedImports: [ 'AxiosRequestConfig' ]
  });
  //import type { UserExtended } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ extendedName ]
  });
  //import { useEffect } from 'react';
  source.addImportDeclaration({
    moduleSpecifier: 'react',
    namedImports: [ 'useEffect' ]
  });
  //import useFetch from '../../../hooks/useFetch';
  source.addImportDeclaration({
    moduleSpecifier: '../../../hooks/useFetch',
    defaultImport: 'useFetch'
  });
  //export default function useDetail(id: string, method: string, path: string, options: AxiosRequestConfig = {})
  source.addFunction({
    isDefaultExport: true,
    name: 'useDetail',
    parameters: [
      { name: 'id', type: 'string' },
      { name: 'method', type: 'string' },
      { name: 'path', type: 'string' },
      { name: 'options', type: 'AxiosRequestConfig', initializer: '{}' }
    ],
    statements: (`
      const action = useFetch<${extendedName}>(method, path, options);
      useEffect(() => {
        if (!id) return;
        action.call({ params: { id } });
      }, [ id ]);
      return {
        reset: action.reset,
        status: action.status,
        response: action.response
      };
    `)
  });

  source.formatText();
};