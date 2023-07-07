//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Type from '../../../../types/Type';
import { VariableDeclarationKind } from 'ts-morph';
import { capitalize, camelfy } from '../../../../utils';

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

  //import type { FieldsProps, FieldsetProps } from 'frui';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: 'frui',
    namedImports: [ 'FieldsProps', 'FieldsetProps' ]
  });

  //import type { Line } from '../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../types',
    namedImports: [ typeName ]
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

  //import useFieldset from '../hooks/useFieldsets';
  source.addImportDeclaration({
    defaultImport: 'useFieldsets',
    moduleSpecifier: '../hooks/useFieldsets'
  });
  
  //import { Button, Fieldset as make } from 'frui/react';
  source.addImportDeclaration({
    moduleSpecifier: 'frui/react',
    namedImports: [ 'Button', 'Fieldset as make' ]
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
    statements: `
      const { values, index, set } = props;
      //hooks
      const { _ } = useLanguage();
      const { handlers, value } = useFieldsets({ values, index, set});
    
      return (
        <div>
          <div style={{ marginTop: 4px }}>
            <h3 style={{ flexGrow: 1 }}>
              {_('${typeLabel} %s', index + 1)}
            </h3>
            <Button 
              transparent
              danger
              style={{ padding: '4px 8px' }}
              onClick={handlers.remove}
            >
              &times;
            </Button>
          </div>
          ${columns.map((column, i) => (`
            <div style={{ marginTop: 4px, position: 'relative', zIndex: ${5000 - (i + 1)} }}>
              <${capitalize(camelfy(column.name))}Field
                label={_('${column.label}')}
                change={(paths, value) => handlers.change(
                  Array.isArray(paths) ? paths[0] : paths, 
                  value
                )}
                defaultValue={value?.[index]?.${column.name}}
              />
            </div>
          `)).join('\n')}
        </div>
      );
    `
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