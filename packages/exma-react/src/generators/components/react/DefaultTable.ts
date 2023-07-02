//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../../types/Model';
import { 
  capitalize, 
  camelfy,
  getTypeExtendedName,
  formatCode
} from '../../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const extendedName = getTypeExtendedName(model);
  const columns = model.columns.filter(column => 
    column.list.config.component
      || column.list.method === 'none' 
      || column.list.method === 'escaped'
  );

  const path = `${model.name}/components/DefaultTable.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { FilterHandlers } from 'inceptjs';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: 'inceptjs',
    namedImports: [ 'FilterHandlers' ]
  });
  //import type { ModelTypeExtended } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ extendedName ]
  });
  //import React from 'react';
  source.addImportDeclaration({
    defaultImport: 'React',
    moduleSpecifier: 'react'
  });
  //import { useLanguage } from 'r22n';
  source.addImportDeclaration({
    moduleSpecifier: 'r22n',
    namedImports: [ 'useLanguage' ]
  });
  //import { useStripe } from 'inceptjs';
  source.addImportDeclaration({
    moduleSpecifier: 'inceptjs',
    namedImports: [ 'useStripe' ]
  });
  //import { Table, Thead, Trow, Tcol } from 'frui/react/Table';
  source.addImportDeclaration({
    moduleSpecifier: 'frui/react/Table',
    namedImports: [ 'Table', 'Thead', 'Trow', 'Tcol' ]
  });
  //import { RoleFormat, ActiveFormat, ... } from './ListFormats';
  source.addImportDeclaration({
    moduleSpecifier: `./ListFormats`,
    namedImports: columns.map(
      column => `${capitalize(camelfy(column.name))}Format`
    )
  });
  //export type DefaultTableProps
  source.addTypeAlias({
    isExported: true,
    name: 'DefaultTableProps',
    type: formatCode(`{
      filters: Record<string, any>,
      handlers: FilterHandlers,
      stripes: [string, string],
      rows?: ${extendedName}[]
    }`)
  });
  //export default function DefaultTable(props: )
  source.addFunction({
    isDefaultExport: true,
    name: 'DefaultTable',
    parameters: [
      { name: 'props', type: 'DefaultTableProps' }
    ],
    returnType: 'React.ReactElement',
    statements: formatCode(`
      const { filters, handlers, stripes, rows } = props
      const { _ } = useLanguage();
      const stripe = useStripe(stripes[0], stripes[1]);
      return React.createElement(
        Table,
        ${columns.map((column) => {
          if (column.sortable) {
            return (`
              React.createElement(
                Thead,
                {
                  className: 'text-right text-blue-600',
                  noWrap: true,
                  stickyTop: true
                },
                React.createElement(
                  'span',
                  { style: { cursor: 'pointer' }, onClick: () => handlers.sort('${column.name}') },
                  _('${column.label}')
                ),
                !filters['sort[${column.name}]'] ? React.createElement(
                  'i', { style: { marginLeft: '2px', fontSize: '10px' }, className: 'fas fa-sort' }
                ): null,
                filters['sort[${column.name}]'] === 'asc' ? React.createElement(
                  'i', { style: { marginLeft: '2px', fontSize: '10px' }, className: 'fas fa-sort-up' }
                ): null,
                filters['sort[${column.name}]'] === 'desc' ? React.createElement(
                  'i', { style: { marginLeft: '2px', fontSize: '10px' }, className: 'fas fa-sort-down' }
                ): null
              ),
            `);
          }
          return (`
            React.createElement(
              Thead,
              { noWrap: true, stickyTop: true },
              _('${column.label}')
            ),
          `)
        }).join('\n')}
        rows ? rows.map((data, i) => {
          return React.createElement(
            Trow,
            { key: i },
            ${columns.map((column) => (`
              React.createElement(
                Tcol,
                { style: { textAlign: 'left', backgroundColor: stripe(i) } },
                React.createElement(
                  ${capitalize(camelfy(column.name))}Format,
                  { value: data?.${column.name} }
                )
              )
            `)).join(',\n')}
          )
        }): null
      );
    `)
  });
};