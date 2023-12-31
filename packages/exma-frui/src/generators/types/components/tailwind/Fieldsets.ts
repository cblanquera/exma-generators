//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Type from '../../../../types/Type';
import { VariableDeclarationKind } from 'ts-morph';
import { capitalize, camelfy, formatCode } from '../../../../utils';

type Location = Project|Directory;

export default function generateFieldset(project: Location, name: string) {
  const type = new Type(name);
  const capital = capitalize(type.name);
  const typeName = capital;
  const typeLabel = Array.isArray(type.attributes.label) 
    ? type.attributes.label[0]
    : capital;
  const typeDefault = JSON.stringify(
    Array.isArray(type.attributes.default) 
      ? type.attributes.default[0]
      : {}
  );
  const columns = type.columns.filter(
    column => column.field.config.component
  );
  
  const path = `types/${type.name.toLowerCase()}/components/Fieldsets.tsx`;
  const source = project.createSourceFile(path, '', { overwrite: true });

  //import type { FieldsProps, FieldsetProps } from 'frui-tailwind';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: 'frui-tailwind',
    namedImports: [ 'FieldsProps', 'FieldsetProps' ]
  });

  //import type { Line } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ typeName ]
  });

  //import { useLanguage } from 'r22n';
  source.addImportDeclaration({
    moduleSpecifier: 'r22n',
    namedImports: [ 'useLanguage' ]
  });

  //import useFieldset from '../hooks/useFieldsets';
  source.addImportDeclaration({
    defaultImport: 'useFieldsets',
    moduleSpecifier: '../hooks/useFieldsets'
  });
  
  //import { Button, Fieldset as make } from 'frui-tailwind';
  source.addImportDeclaration({
    moduleSpecifier: 'frui-tailwind',
    namedImports: [ 'Button', 'fieldset as make' ]
  });
  
  //import { NameField, CurrencyField, PriceField } from './FormFields';
  source.addImportDeclaration({
    moduleSpecifier: './FormFields',
    namedImports: columns.map(column => `${capitalize(camelfy(column.name))}Field`)
  });

  //const Fields: React.FC<FieldsProps<Line>> = (props) => {...}
  source.addFunction({
    isExported: false,
    name: 'Fields',
    parameters: [{ name: 'props', type: `FieldsProps<${typeName}>` }],
    statements: formatCode(`
      const { data, values, index, set } = props;
      //hooks
      const { _ } = useLanguage();
      const { handlers, value } = useFieldsets({ values, index, set});
      //check layout
      const inline = data?.layout === 'inline';
      //this is used to find out the first non-empty value
      let i = 0
      for (; i < (values?.length || 0); i++) {
        if (values?.[i] !== undefined) {
          break;
        }
      }
      //render
      return (
        <div className={\`relative\${inline ? ' flex items-end': ''}\`} style={{ zIndex: 5000 - index }}>
          {!inline && (
            <div className="flex items-center mt-2">
              <h3 className="flex-grow">
                {_('${typeLabel} %s', index + 1)}
              </h3>
              <Button 
                transparent
                danger
                className="px-4 py-2"
                onClick={handlers.remove}
              >
                &times;
              </Button>
            </div>
          )}
          ${columns.map((column, i) => (`
            <div className={\`\${inline? 'mb-0.5 mr-0.5': 'mt-2'} flex-grow relative z-[${5000 - (i + 1)}]\`}>
              <${capitalize(camelfy(column.name))}Field
                label={!inline || index === i ? _('${column.label}') : undefined}
                change={(paths, value) => handlers.change(
                  Array.isArray(paths) ? paths[0] : paths, 
                  value
                )}
                defaultValue={value?.${column.name}}
              />
            </div>
          `)).join('\n')}
          {inline && (
            <Button 
              transparent
              danger
              className="px-4 py-2 mb-0.5"
              onClick={handlers.remove}
            >
              &times;
            </Button>
          )}
        </div>
      );
    `)
  });

  //const Fieldset = make<Line>(Fields);
  source.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{
          name: 'Fieldset',
          initializer: `make<${typeName}>(Fields)`
      }]
  });

  //const Fieldsets: React.FC<FieldsetProps<Line>> = (props) => {...}
  source.addFunction({
    isDefaultExport: true,
    name: 'Fieldsets',
    parameters: [{ name: 'props', type: `FieldsetProps<${typeName}>` }],
    statements: `return <Fieldset {...props} emptyValue={${typeDefault}} />;`
  });

  source.formatText();
};