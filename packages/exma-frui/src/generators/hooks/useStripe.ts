//types
import type { Project, Directory } from 'ts-morph';

type Location = Project|Directory;

const code = `export default function useStripe(color1: string, color2: string) {
  let active = color1;
  const toggle = (change?: number|boolean) => {
    if (typeof change === 'number') {
      return change % 2 === 0? color1: color2;
    }

    if (change) {
      active = active === color1? color2: color1;
    }
    
    return active;
  };

  return toggle;
}`;

export default function generate(project: Location) {
  project.createSourceFile(`hooks/useStripe.ts`, code, { overwrite: true });
};