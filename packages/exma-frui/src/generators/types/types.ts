//types
import type { Project, Directory } from 'ts-morph';
//helpers
import Type from '../../types/Type';
import { capitalize } from '../../utils';

type Location = Project|Directory;

export default function generate(project: Location, typePath: string, name: string) {
  const type = new Type(name);
  const capital = capitalize(type.name);
  const typeName = capital;

  const path = `types/${type.name.toLowerCase()}/types.ts`;
  const source = project.createSourceFile(path, '', { overwrite: true });
  //import type { User } from '../../types';
  source.addImportDeclaration({
    isTypeOnly: true,
    moduleSpecifier: `../../${typePath}`,
    namedImports: [ typeName ]
  });

  //export type { User }
  source.addExportDeclaration({
    namedExports: [ typeName ],
    isTypeOnly: true
  });
};