import { DataTransformerInfo } from '../types';

import { DataTransformerID } from './ids';

export interface NoopTransformerOptions {
  include?: string;
  exclude?: string;
}

export const noopTransformer: DataTransformerInfo<NoopTransformerOptions> = {
  id: DataTransformerID.noop,
  name: 'noop',
  description: 'No-operation transformer',
  defaultOptions: {},

  /**
   * Return a modified copy of the series.  If the transform is not or should not
   * be applied, just return the input series
   */
  operator: (options: NoopTransformerOptions) => (source) => source,
};
