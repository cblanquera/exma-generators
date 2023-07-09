//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Type from '../../../types/Type';
import { VariableDeclarationKind } from 'ts-morph';
import { capitalize, camelfy, formatCode } from '../../../utils';

type Location = Project|Directory;

export default function generateViewFormats(project: Location, name: string, ui = 'react') {
  const type = new Type(name);
  const columns = type.columns.filter(
    column => column.view.config.component
  );
  const columnsNone = type.columns.filter(
    (column) => column.view.config.component
      || column.view.method === 'none' 
      || column.view.method === 'escaped'
  );
  
  const path = `types/${type.name.toLowerCase()}/components/ViewFormats.tsx`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  
  if (columns.length > 0) {
    //import type { FieldSelectProps, FieldInputProps } from 'frui-tailwind/formats'
    source.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: `frui-${ui}/formats`,
      namedImports: columns
        .map(column => `${column.view.config.component}Props`)
        .filter((value, index, array) => array.indexOf(value) === index)
    });
  }
  //import React from 'react';
  source.addImportDeclaration({
    defaultImport: 'React',
    moduleSpecifier: 'react'
  });
  columns
    .map(column => column.view.config.component)
    .filter((value, index, array) => array.indexOf(value) === index)
    .forEach(defaultImport => {
      if (defaultImport) {
        //import FieldInput from 'frui/tailwind/formats/Input';
        source.addImportDeclaration({ 
          defaultImport, 
          moduleSpecifier: `frui-${ui}/formats/${defaultImport}` 
        });
      }
    });
  //export type FormatComponentProps
  source.addTypeAlias({
    isExported: true,
    name: 'FormatComponentProps',
    type: 'Record<string, any>'
  });
  //export NameFormat: (props: FormatComponentProps) => React.ReactElement
  columnsNone.forEach((column) => {
    source.addFunction({
      isExported: true,
      name: `${capitalize(camelfy(column.name))}Format`,
      parameters: [
        { name: 'props', type: 'FormatComponentProps' }
      ],
      returnType: 'React.ReactElement',
      statements: column.view.method === 'none' 
        || column.view.method === 'escaped' ? formatCode(`
        return (props.value);
      `) : formatCode(`
        const { value, ...others } = props;
        const attributes: ${column.view.config.component}Props = Object.assign(
          ${JSON.stringify(column.view.attributes || {}, null, 2)},
          { value },
          others || {}
        );
        return (
          <${column.view.config.component} {...attributes} />
        );
      `)
    });
  });
  //export default
  source.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{
        name: 'ViewFormats',
        initializer: (`{
          ${columnsNone
            .map((column) => `${capitalize(camelfy(column.name))}Format`)
            .join(',\n')}
        }`),
    }]
  });
  source.addExportAssignment({
    isExportEquals: false,
    expression: 'ViewFormats'
  });

  source.formatText();
};