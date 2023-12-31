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
  //import type { ModelType } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ 
      typeName, 
      extendedName
    ].filter((value, index, array) => array.indexOf(value) === index)
  });
  if (columns.length) {
    //import { useLanguage } from 'r22n';
    source.addImportDeclaration({
      moduleSpecifier: 'r22n',
      namedImports: [ 'useLanguage' ]
    });
    //import Loader from 'frui-tailwind/Loader';
    source.addImportDeclaration({
      defaultImport: 'Loader',
      moduleSpecifier: 'frui-tailwind/Loader'
    });
    //import Button from 'frui-tailwind/Button';
    source.addImportDeclaration({
      defaultImport: 'Button',
      moduleSpecifier: 'frui-tailwind/Button'
    });
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
    statements: columns.length ? formatCode((`
      const { handlers, data, response, status } = props;
      const { _ } = useLanguage();
      return (
        <form onSubmit={handlers.send}>
          ${columns.map((column, i) => (`
            <div className="mt-2 relative z-[${5000 - (i + 1)}]">
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
            className="mt-4"
            disabled={status === 'fetching'}
          >
            {status === 'fetching' ? <Loader /> : _('Submit')}
          </Button>
        </form>
      );
    `).replace(/[\n\r]+/, "\n")): 'return null;'
  });

  source.formatText();
};