//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../../types/Model';
import { VariableDeclarationKind } from 'ts-morph';
import { capitalize, camelfy } from '../../../utils';

type Location = Project|Directory;

export default function generateViewFormats(project: Location, name: string, ui = 'react') {
  const model = new Model(name);
  const columns = model.filterables.filter(
    column => column.field.config.component
  );
  
  const path = `models/${model.name.toLowerCase()}/components/FilterFields.tsx`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  
  if (columns.length) {
    //import type { FieldSelectProps, FieldInputProps } from 'frui'
    source.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: 'frui',
      namedImports: columns
      .map(column => `${column.field.config.component}Props`)
      .filter((value, index, array) => array.indexOf(value) === index)
    });
  }
  //import React from 'react';
  source.addImportDeclaration({
    defaultImport: 'React',
    moduleSpecifier: 'react'
  });
  //import Control from 'frui/tailwind/Control';
  source.addImportDeclaration({
    defaultImport: 'Control',
    moduleSpecifier: `frui/${ui}/Control`
  });
  columns
    .map(column => column.field.config.component)
    .filter((value, index, array) => array.indexOf(value) === index)
    .forEach(defaultImport => {
      if (defaultImport) {
        //import FieldInput from 'frui/tailwind/FieldInput';
        source.addImportDeclaration({ 
          defaultImport, 
          moduleSpecifier: `frui/${ui}/${defaultImport}` 
        });
      }
    });

  //export type FilterComponentProps
  source.addTypeAlias({
    isExported: true,
    name: 'FilterComponentProps',
    type: (`Record<string, any> & {
      label?: string,
      error?: string,
      filter: (value: Record<string, any>) => void
    }`)
  });
  //export NameFilter: (props: FilterComponentProps) => React.ReactElement
  columns.forEach(column => {
    source.addFunction({
      isExported: true,
      name: `${capitalize(camelfy(column.name))}Filter`,
      parameters: [
        { name: 'props', type: 'FilterComponentProps' }
      ],
      returnType: 'React.ReactElement',
      statements: column.spanable ? (`
        const { label, error, filter, ...fieldProps } = props;
        const attributes: ${column.field.config.component}Props = Object.assign(
          ${JSON.stringify(column.field.attributes || {}, null, 2)},
          fieldProps
        );
        attributes.error = Boolean(error);
        const minAttributes = Object.assign({}, attributes, {
          onUpdate: (value: string|number|Date) => filter({'filter[${column.name}][0]': value})
        });
        const maxAttributes = Object.assign({}, attributes, {
          onUpdate: (value: string|number|Date) => filter({'filter[${column.name}][1]': value})
        });
        return (
          <Control label={label} error={error}>
            <${column.field.config.component} {...minAttributes} />
            <${column.field.config.component} {...maxAttributes} />
          </Control>
        );
      `): (`
        const { label, error, filter, ...fieldProps } = props;
        const attributes: ${column.field.config.component}Props = Object.assign(
          ${JSON.stringify(column.field.attributes || {}, null, 2)},
          fieldProps
        );
        attributes.error = Boolean(error);
        attributes.onUpdate = value => filter({'filter[${column.name}]': value});
        return (
          <Control label={label} error={error}>
            <${column.field.config.component} {...attributes} />
          </Control>
        );
      `).replace(/[\n\r]+/, "\n")
    });
  });
  //export default
  source.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{
        name: 'FilterFields',
        initializer: (`{
          ${columns
            .map((column) => `${capitalize(camelfy(column.name))}Filter`)
            .join(',\n')}
        }`),
    }]
  });
  source.addExportAssignment({
    isExportEquals: false,
    expression: 'FilterFields'
  });

  source.formatText();
};