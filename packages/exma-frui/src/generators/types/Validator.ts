//types
import type { Project, Directory } from 'ts-morph';

import fs from 'fs';
import path from 'path';

type Location = Project|Directory;

export default function generate(project: Location) {
  const file = path.resolve(__dirname, '../../../src/types/Validator.ts');
  project.createSourceFile(
    `types/Validator.ts`, 
    fs.readFileSync(file, 'utf8'), 
    { overwrite: true }
  );
};
