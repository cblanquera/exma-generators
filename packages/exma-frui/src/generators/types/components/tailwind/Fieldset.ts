//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Type from '../../../../types/Type';
import { capitalize, camelfy } from '../../../../utils';

type Location = Project|Directory;

export default function generateFieldset(project: Location, name: string) {
  const type = new Type(name);
  const columns = type.columns.filter(
    column => column.field.config.component
  );
  
  const path = `types/${type.name.toLowerCase()}/components/Fieldset.tsx`;
  const source = project.createSourceFile(path, '', { overwrite: true });

  //import type { FieldsetProps } from "../hooks/useFieldset";
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: '../hooks/useFieldset',
    namedImports: [ 'FieldsetProps' ]
  });
  
  //import React from "react";
  source.addImportDeclaration({
    defaultImport: 'React',
    moduleSpecifier: 'react'
  });
  
  //import { useLanguage } from "r22n";
  source.addImportDeclaration({
    moduleSpecifier: 'r22n',
    namedImports: [ 'useLanguage' ]
  });
  
  //import useFieldset from "../hooks/useFieldset";
  source.addImportDeclaration({
    defaultImport: 'useFieldset',
    moduleSpecifier: '../hooks/useFieldset'
  });
  
  //import { NameField, CurrencyField, UnitField, QuantityField } from "./FormFields";
  source.addImportDeclaration({
    moduleSpecifier: './FormFields',
    namedImports: columns.map(column => `${capitalize(camelfy(column.name))}Field`)
  });

  //export default function Fieldset(props: FieldsetProps) {...}
  source.addFunction({
    isDefaultExport: true,
    name: 'Fieldset',
    parameters: [{ name: 'props', type: 'FieldsetProps' }],
    statements: `
      //hooks
      const { _ } = useLanguage();
      const { handlers, value } = useFieldset(props);
    
      return (
        <div>
          ${columns.map((column, i) => (`
            <div className="mt-2 relative z-[${5000 - (i + 1)}]">
              <${capitalize(camelfy(column.name))}Field
                label={_('${column.label}')}
                change={(paths, value) => handlers.change(
                  Array.isArray(paths) ? paths[0] : paths,
                  value
                )}
                defaultValue={value?.name}
              />
            </div>
          `)).join('\n')}
        </div>
      );
    `
  });

  source.formatText();
};