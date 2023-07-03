//types
import type { Project, Directory } from 'ts-morph';

import fs from 'fs';
import path from 'path';

type Location = Project|Directory;

export default function generate(project: Location) {
  const file = path.resolve(__dirname, '../../../src/hooks/useForm.ts');
  project.createSourceFile(
    `hooks/useForm.ts`, 
    fs.readFileSync(file, 'utf8'), 
    { overwrite: true }
  );
};