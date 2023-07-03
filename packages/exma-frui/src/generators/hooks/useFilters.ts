//types
import type { Project, Directory } from 'ts-morph';

import fs from 'fs';
import path from 'path';

type Location = Project|Directory;

export default function generate(project: Location) {
  const file = path.resolve(__dirname, '../../../src/hooks/useFilters.ts');
  project.createSourceFile(
    `hooks/useFilters.ts`, 
    fs.readFileSync(file, 'utf8'), 
    { overwrite: true }
  );
};