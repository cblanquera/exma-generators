//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../../../types/Model';
import { capitalize, camelfy } from '../../../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const typeName = capitalize(model.name);
  const extendedName = model.relations.length ? `${typeName}Extended` : typeName;
  const columns = model.columns.filter(column => 
    column.view.config.component
      || column.view.method === 'none' 
      || column.view.method === 'escaped'
  );

  const path = `models/${model.name.toLowerCase()}/components/DefaultView.tsx`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  
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
  //import { Table, Thead, Trow, Tcol } from 'frui/tailwind/Table';
  source.addImportDeclaration({
    moduleSpecifier: 'frui/tailwind/Table',
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
    type: (`{
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
    statements: (`
      const { stripes, data } = props
      const { _ } = useLanguage();
      const stripe = useStripe(stripes[0], stripes[1]);
      return (
        <Table>
          ${columns.map((column) => (`
            <Trow>
              <Tcol className={\`text-left \${stripe(true)}\`}>
                {_(\`${column.label}\`)}
              </Tcol>
              <Tcol className={\`text-left \${stripe()}\`}>
                <${capitalize(camelfy(column.name))}Format value={data?.${column.name}} />
              </Tcol>
            </Trow>
          `)).join('\n')}
        </Table>
      );
    `).replace(/[\n\r]+/, "\n")
  });

  source.formatText();
};