//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../types/Model';
import { getTypeExtendedName, formatCode } from '../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const path = `model/${model.name}/hooks/useSearch.ts`;
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
  //import { useState, useEffect } from 'react';
  source.addImportDeclaration({
    moduleSpecifier: 'react',
    namedImports: [ 'useState', 'useEffect' ]
  });
  //import { useFetch, useFilters } from '../../../../hooks';
  source.addImportDeclaration({
    moduleSpecifier: '../../../../hooks',
    namedImports: [ 'useFetch', 'useFilters' ]
  });
  //export default function useSearch(method: string, path: string, query: Record<string, any>, options: AxiosRequestConfig = {})
  source.addFunction({
    isDefaultExport: true,
    name: 'useSearch',
    parameters: [
      { name: 'query', type: 'Record<string, any>' },
      { name: 'options', type: 'AxiosRequestConfig', initializer: '{}' }
    ],
    statements: formatCode(`
      const action = useFetch<${getTypeExtendedName(model)}[]>(method, path, options);
      const { filters, handlers } = useFilters(query);
      const [ last, setLast ] = useState<Record<string, any>>();
      const serialize = (value: any) => JSON.stringify(value);
      useEffect(() => {
        if (serialize(filters) === serialize(last)) return;
        setLast(filters);
        action.call({ query: filters });
      }, [ filters ]);
      return {
        filters,
        handlers,
        reset: action.reset,
        status: action.status,
        response: action.response
      };
    `)
  });
};