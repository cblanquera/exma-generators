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
  const columns = model.filterables.filter(
    column => column.field.config.component
  );

  const path = `models/${model.name.toLowerCase()}/components/DefaultFilters.tsx`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  
  //import type { APIResponse, FetchStatuses } from "../../../hooks/useFetch";
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../../../hooks/useFetch',
    namedImports: [ 'APIResponse', 'FetchStatuses' ]
  });
  //import type { FilterHandlers } from "../../../hooks/useFilters";
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../../../hooks/useFilters',
    namedImports: [ 'FilterHandlers' ]
  });
  //import type { User } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ extendedName ]
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
    //import { RoleFilter, ActiveFilter, ... } from './FilterFields';
    source.addImportDeclaration({
      moduleSpecifier: `./FilterFields`,
      namedImports: columns.map(
        column => `${capitalize(camelfy(column.name))}Filter`
      )
    });
  }
  //export type DefaultFiltersProps
  source.addTypeAlias({
    isExported: true,
    name: 'DefaultFiltersProps',
    type: (`{
      handlers: FilterHandlers,
      data?: Record<string, string|number>,
      response?: APIResponse<${extendedName}>,
      status: FetchStatuses
    }`)
  });
  //export default function DefaultFilters(props: )
  source.addFunction({
    isDefaultExport: true,
    name: 'DefaultFilters',
    parameters: [
      { name: 'props', type: 'DefaultFiltersProps' }
    ],
    statements: columns.length ? formatCode((`
      const { handlers, data, response, status } = props;
      const { _ } = useLanguage();
      return (
        <form onSubmit={handlers.send}>
          ${columns.map((column, i) => (`
            <div className="mt-2 relative z-[${5000 - (i + 1)}]">
              <${capitalize(camelfy(column.name))}Filter 
                label={_('By ${column.label}')} 
                error={response?.errors?.${column.name}}
                filter={handlers.filter}
                defaultValue={data ? data['filter[${column.name}]'] : undefined}
              />
            </div>
          `)).join('\n')}
          <Button type="submit" className="mt-2" disabled={status === 'fetching'}>
            {status === 'fetching' ? <Loader /> : _('Filter')}
          </Button>
        </form>
      );
    `).replace(/[\n\r]+/, "\n")): 'return null;'
  });

  source.formatText();
};