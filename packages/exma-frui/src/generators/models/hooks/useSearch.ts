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
  const path = `models/${model.name.toLowerCase()}/hooks/useSearch.ts`;
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
  //import { useState, useEffect } from 'react';
  source.addImportDeclaration({
    moduleSpecifier: 'react',
    namedImports: [ 'useState', 'useEffect' ]
  });
  //import useFetch from '../../../hooks/useFetch';
  source.addImportDeclaration({
    moduleSpecifier: '../../../hooks/useFetch',
    defaultImport: 'useFetch'
  });
  //import useFilters from '../../../hooks/useFilters';
  source.addImportDeclaration({
    moduleSpecifier: '../../../hooks/useFilters',
    defaultImport: 'useFilters'
  });
  //export default function useSearch(method: string, path: string, query: Record<string, any>, options: AxiosRequestConfig = {})
  source.addFunction({
    isDefaultExport: true,
    name: 'useSearch',
    parameters: [
      { name: 'query', type: 'Record<string, any>' },
      { name: 'method', type: 'string' },
      { name: 'path', type: 'string' },
      { name: 'options', type: 'AxiosRequestConfig', initializer: '{}' }
    ],
    statements: (`
      const action = useFetch<${extendedName}[]>(method, path, options);
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

  source.formatText();
};