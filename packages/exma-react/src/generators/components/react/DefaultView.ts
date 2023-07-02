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
    column.view.config.component
      || column.view.method === 'none' 
      || column.view.method === 'escaped'
  );

  const path = `${model.name}/components/DefaultView.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
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
    namedImports: [ 'Table', 'Trow', 'Tcol' ]
  });
  if (columns.length) {
    //import { RoleFormat, ActiveFormat, ... } from './ListFormats';
    source.addImportDeclaration({
      moduleSpecifier: `./ViewFormats`,
      namedImports: columns.map(
        column => `${capitalize(camelfy(column.name))}Format`
      )
    });
  }
  //export type DefaultViewProps
  source.addTypeAlias({
    isExported: true,
    name: 'DefaultViewProps',
    type: formatCode(`{
      stripes: [string, string],
      data?: ${extendedName}
    }`)
  });
  //export default function DefaultView(props: )
  source.addFunction({
    isDefaultExport: true,
    name: 'DefaultView',
    parameters: [
      { name: 'props', type: 'DefaultViewProps' }
    ],
    returnType: 'React.ReactElement',
    statements: formatCode(`
      const { stripes, data } = props
      const { _ } = useLanguage();
      const stripe = useStripe(stripes[0], stripes[1]);
      return React.createElement(
        Table,
        ${columns.map((column) => (`
          React.createElement(
            Trow,
            React.createElement(
              Tcol,
              { style: { textAlign: 'left', backgroundColor: stripe(true) } },
              _('${column.label}')
            ),
            React.createElement(
              Tcol,
              { style: { textAlign: 'left', backgroundColor: stripe() } },
              React.createElement(
                ${capitalize(camelfy(column.name))}Format,
                { value: data?.${column.name} }
              )
            )
          )
        `)).join(',\n')}
      );
    `)
  });
};