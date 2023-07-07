//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../../../types/Model';
import { capitalize, camelfy } from '../../../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const typeName = capitalize(camelfy(model.name));
  const extendedName = model.relations.length ? `${typeName}Extended` : typeName;
  const columns = model.columns.filter(column => 
    column.list.config.component
      || column.list.method === 'none' 
      || column.list.method === 'escaped'
  );

  const path = `models/${model.name.toLowerCase()}/components/DefaultTable.tsx`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { FilterHandlers } from "../../../hooks/useFilters";
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../../../hooks/useFilters',
    namedImports: [ 'FilterHandlers' ]
  });
  //import type { UserExtended } from '../types';
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
  //import useStripe from '../../../hooks/useStripe';
  source.addImportDeclaration({
    moduleSpecifier: '../../../hooks/useStripe',
    defaultImport: 'useStripe'
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
    type: (`{
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
    statements: (`
      const { filters, handlers, stripes, rows } = props
      const { _ } = useLanguage();
      const stripe = useStripe(stripes[0], stripes[1]);
      return (
        <Table>
          ${columns.map((column) => {
            if (column.sortable) {
              return (`
                <Thead className="text-right text-blue-600" noWrap stickyTop>
                  <span style={{ cursor: 'pointer' }} onClick={() => handlers.sort('${column.name}')}>
                    _('${column.label}')
                  </span>
                  {!filters['sort[${column.name}]'] ? <i style={{ marginLeft: '2px', fontSize: '10px' }} className="fas fa-sort"></i>: null}
                  {filters['sort[${column.name}]'] === 'asc' ? <i style={{ marginLeft: '2px', fontSize: '10px' }} className="fas fa-sort-up"></i>: null}
                  {filters['sort[${column.name}]'] === 'desc' ? <i style={{ marginLeft: '2px', fontSize: '10px' }} className="fas fa-sort-down"></i>: null}
                </Thead>
              `);
            }
            return (`
              <Thead noWrap stickyTop>
                _('${column.label}')
              </Thead>
            `)
          }).join('\n')}
          {rows ? rows.map((data, i) => (
            <Trow key={i}>
              ${columns.map(column => {
                if (column.filterable) {
                  return (`
                  <Tcol className={\`text-left \${stripe(i)}\`}>
                    <span className="text-blue-600 cursor-pointer" onClick={() => handlers.filter({ 'filter['${column.name}']': data?.${column.name} })}>
                      <${capitalize(camelfy(column.name))}Format value={data?.${column.name}} />
                    </span>
                  </Tcol>
                  `);
                }
                return (`
                  <Tcol className={\`text-left \${stripe(i)}\`}>
                    <${capitalize(camelfy(column.name))}Format value={data?.${column.name}} />
                  </Tcol>
                `);
              }).join('\n')}
              ${columns.map((column) => {
                if (column.filterable) {
                  return (`
                    <Tcol style={{ textAlign: 'left', backgroundColor: stripe(i) }}>
                      <span style={{ color: '#006699', cursor: 'pointer' }} onClick={() => handlers.filter({ 'filter[${column.name}]': data?.${column.name} })}>
                        <${capitalize(camelfy(column.name))}Format value={data?.${column.name}} />
                      </span>
                    </Tcol>
                  `);
                }
                return (`
                  <Tcol style={{ textAlign: 'left', backgroundColor: stripe(i) }}>
                    <${capitalize(camelfy(column.name))}Format value={data?.${column.name}} />
                  </Tcol>
                `);
              }).join('\n')}
            </Trow>
          )): null}
        </Table>
      );
    `)
  });

  source.formatText();
};