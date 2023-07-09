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
    column => column.field.config.component
  );
  
  const path = `types/${type.name.toLowerCase()}/components/FormFields.tsx`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  
  if (columns.length) {
    //import type { SelectProps, InputProps } from 'frui-tailwind/fields'
    source.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: `frui-${ui}/fields`,
      namedImports: columns
        .filter(column => column.field.method !== 'fieldset')
        .map(column => `${column.field.config.component}Props`)
        .filter((value, index, array) => array.indexOf(value) === index)
    });
  }
  if (columns.length) {
    //import React from 'react';
    source.addImportDeclaration({
      defaultImport: 'React',
      moduleSpecifier: 'react'
    });
    //import Control from 'frui-tailwind/Control';
    source.addImportDeclaration({
      defaultImport: 'Control',
      moduleSpecifier: `frui-${ui}/Control`
    });
  }
  columns
    .map(column => column.field.config.component)
    .filter((value, index, array) => array.indexOf(value) === index)
    .forEach(defaultImport => {
      if (defaultImport) {
        //import FieldInput from 'frui-tailwind/fields/Input';
        source.addImportDeclaration({ 
          defaultImport, 
          moduleSpecifier: `frui-${ui}/fields/${defaultImport}` 
        });
      }
    });
  //export type FormComponentProps
  source.addTypeAlias({
    isExported: true,
    name: 'FormComponentProps',
    type: (`Record<string, any> & {
      label?: string,
      error?: string,
      change: (paths: string|string[], value: any) => void
    }`)
  });
  //export NameField: (props: FormComponentProps) => React.ReactElement
  columns.forEach((column) => {
    source.addFunction({
      isExported: true,
      name: `${capitalize(camelfy(column.name))}Field`,
      parameters: [
        { name: 'props', type: 'FormComponentProps' }
      ],
      returnType: 'React.ReactElement',
      statements: formatCode(`
        const { label, error, change, ...fieldProps } = props;
        const attributes: ${column.field.config.component}Props = Object.assign(
          ${JSON.stringify(column.field.attributes || {}, null, 2)},
          fieldProps || {}
        );
        attributes.error = Boolean(error);
        attributes.onUpdate = value => change('${column.name}', value);
        return (
          <Control label={label} error={error}>
            <${column.field.config.component} {...attributes} />
          </Control>
        );
      `)
    });
  });

  //export default
  source.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{
        name: 'FormFields',
        initializer: (`{
          ${columns
            .map(column => `${capitalize(camelfy(column.name))}Field`)
            .join(',\n')}
        }`),
    }]
  });
  source.addExportAssignment({
    isExportEquals: false,
    expression: 'FormFields'
  });

  source.formatText();
};