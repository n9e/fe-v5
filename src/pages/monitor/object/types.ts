export interface IMatch {
  filters: {
    label: string;
    oper: '=' | '=~';
    value: string;
  }[];
  dynamicLabels: {
    label: string;
    value: string;
  }[];
  dimensionLabel: {
    label: string;
    value: string[];
  };
}