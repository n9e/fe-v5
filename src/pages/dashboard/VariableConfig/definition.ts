export interface Variable {
  name: string;
  definition: string;
  reg?: string;
  // selected?: string | string[];
  multi: boolean;
  allOption: boolean;
  options?: string[];
}
