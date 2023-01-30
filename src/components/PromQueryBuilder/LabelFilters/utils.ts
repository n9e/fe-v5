import _ from 'lodash';

export const getMatchByLabels = (
  metric: string,
  labels?: {
    label: string;
    value: string;
    op: string;
  }[],
  currentLabelName?: string,
) => {
  const labelFilters = _.map(
    _.filter(labels, (item) => {
      if (currentLabelName) {
        return item.label !== currentLabelName;
      }
      return !!item.label && !!item.value;
    }),
    ({ label, value, op }) => `${label}${op}"${value}"`,
  );
  return `{__name__="${metric}"${_.isEmpty(labelFilters) ? '' : `,${labelFilters.join(', ')}`}}`;
};
