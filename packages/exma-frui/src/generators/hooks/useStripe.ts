//types
import type { Project, Directory } from 'ts-morph';

import fs from 'fs';
import path from 'path';

type Location = Project|Directory;

export default function generate(project: Location) {
  const file = path.resolve(__dirname, '../../../src/hooks/useStripe.ts');
  project.createSourceFile(
    `hooks/useStripe.ts`, 
    fs.readFileSync(file, 'utf8'), 
    { overwrite: true }
  );
};