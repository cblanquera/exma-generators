//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../../types/Model';
import { 
  capitalize, 
  camelfy,
  getTypeName, 
  getTypeExtendedName,
  formatCode
} from '../../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const typeName = getTypeName(model);
  const extendedName = getTypeExtendedName(model);
  const columns = model.columns.filter(
    column => column.field.config.component
  );

  const path = `${model.name}/components/DefaultForm.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  
  //import type { APIResponse, FetchStatuses, FormHandlers } from 'inceptjs';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: 'inceptjs',
    namedImports: [ 'APIResponse', 'FetchStatuses', 'FormHandlers' ]
  });
  //import type { ModelType } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ 
      typeName, 
      extendedName
    ].filter((value, index, array) => array.indexOf(value) === index)
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
  //import Loader from 'frui/react/Loader';
  source.addImportDeclaration({
    defaultImport: 'Loader',
    moduleSpecifier: 'frui/react/Loader'
  });
  //import Button from 'frui/react/Button';
  source.addImportDeclaration({
    defaultImport: 'Button',
    moduleSpecifier: 'frui/react/Button'
  });
  if (columns.length) {
    //import { RoleField, ActiveField, ... } from './FormFields';
    source.addImportDeclaration({
      moduleSpecifier: `./FormFields`,
      namedImports: columns.map(
        column => `${capitalize(camelfy(column.name))}Field`
      )
    });
  }
  //export type DefaultFormProps
  source.addTypeAlias({
    isExported: true,
    name: 'DefaultFormProps',
    type: formatCode(`{
      handlers: FormHandlers,
      data?: Partial<${typeName}>|Partial<${extendedName}>,
      response?: APIResponse<${extendedName}>,
      status: FetchStatuses
    }`)
  });
  //export default function DefaultForm(props: )
  source.addFunction({
    isDefaultExport: true,
    name: 'DefaultForm',
    parameters: [
      { name: 'props', type: 'DefaultFormProps' }
    ],
    returnType: 'React.ReactElement',
    statements: formatCode(`
      const { handlers, data, response, status } = props;
      const { _ } = useLanguage();
      return React.createElement(
        'form',
        { onSubmit: handlers.send },
        ${columns.map((column, i) => (`
          React.createElement(
            'div',
            { style: { marginTop: '8px', position: 'relative', zIndex: ${5000 - (i + 1)} } },
            React.createElement(
              ${capitalize(camelfy(column.name))}Field,
              {
                label: _('${column.label}'),
                error: response?.errors?.${column.name},
                change: handlers.change,
                defaultValue: data?.${column.name}
              }
            )
          ),
        `)).join('\n')}
        React.createElement(Button, {
          type: 'submit',
          info: true,
          style: { marginTop: '16px' },
          disabled: status === 'fetching'
        }, status === 'fetching' ? React.createElement(Loader) : _('Submit'))
      );
    `)
  });
};