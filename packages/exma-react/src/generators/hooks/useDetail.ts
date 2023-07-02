//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../types/Model';
import { getTypeExtendedName, formatCode } from '../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const path = `model/${model.name}/hooks/useDetail.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { AxiosRequestConfig } from 'axios';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: 'axios',
    namedImports: [ 'AxiosRequestConfig' ]
  });
  //import type { ModelTypeExtended } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ getTypeExtendedName(model) ]
  });
  //import { useEffect } from 'react';
  source.addImportDeclaration({
    moduleSpecifier: 'react',
    namedImports: [ 'useEffect' ]
  });
  //import { useFetch } from '../../../../hooks';
  source.addImportDeclaration({
    moduleSpecifier: '../../../../hooks',
    namedImports: [ 'useFetch' ]
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
    statements: formatCode(`
      const action = useFetch<${getTypeExtendedName(model)}>(method, path, options);
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
};