//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Model from '../../../../types/Model';
import { capitalize, camelfy, formatCode } from '../../../../utils';

type Location = Project|Directory;

export default function generate(project: Location, name: string) {
  const model = new Model(name);
  const typeName = capitalize(camelfy(model.name));
  const extendedName = model.relations.length ? `${typeName}Extended` : typeName;
  const columns = model.columns.filter(
    column => column.field.config.component
  );

  const path = `models/${model.name.toLowerCase()}/components/DefaultForm.tsx`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  
  //import type { APIResponse, FetchStatuses } from "../../../hooks/useFetch";
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../../../hooks/useFetch',
    namedImports: [ 'APIResponse', 'FetchStatuses' ]
  });
  //import type { FormHandlers } from "../../../hooks/useForm";
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../../../hooks/useForm',
    namedImports: [ 'FormHandlers' ]
  });
  //import type { UserType } from '../types';
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
  //import Loader from 'frui-react/Loader';
  source.addImportDeclaration({
    defaultImport: 'Loader',
    moduleSpecifier: 'frui-react/Loader'
  });
  //import Button from 'frui-react/Button';
  source.addImportDeclaration({
    defaultImport: 'Button',
    moduleSpecifier: 'frui-react/Button'
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
    type: (`{
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
      return (
        <form onSubmit={handlers.send}>
          ${columns.map((column, i) => (`
            <div style={{ marginTop: '8px', position: 'relative', zIndex: ${5000 - (i + 1)} }}>
              <${capitalize(camelfy(column.name))}Field
                label={_('${column.label}')}
                error={response?.errors?.${column.name}}
                change={handlers.change}
                defaultValue={data?.${column.name}}
              />
            </div>
          `)).join('\n')}
          <Button
            type="submit"
            info
            style={{ marginTop: '16px' }}
            disabled={status === 'fetching'}
          >
            {status === 'fetching' ? <Loader /> : _('Submit')}
          </Button>
        </form>
      );
    `)
  });

  source.formatText();
};