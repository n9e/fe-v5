export interface Variable {
  name: string;
  definition: string;
  reg?: RegExp;
  selected?: string | string[];
  multi: boolean;
  allOption: boolean;
}
