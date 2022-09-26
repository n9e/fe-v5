import _ from 'lodash';
import { defaultThreshold } from './config';

export const normalizeInitialValues = (values: any) => {
  const thresholdsSteps = _.cloneDeep(values.options?.thresholds?.steps) || [];
  if (thresholdsSteps.length === 0) {
    thresholdsSteps.push(defaultThreshold);
  } else if (thresholdsSteps.length === 1 && thresholdsSteps[0].type !== 'base') {
    thresholdsSteps.unshift(defaultThreshold);
  }
  return {
    ...values,
    options: {
      ...values.options,
      thresholds: {
        ...(values.options?.thresholds || {}),
        steps: thresholdsSteps,
      },
    },
  };
};
