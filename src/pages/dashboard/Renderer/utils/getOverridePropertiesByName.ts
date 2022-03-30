import _ from 'lodash';

const getOverridePropertiesByName = (overrides: any[], name: string) => {
  let properties: any = {};
  _.forEach(overrides, (item) => {
    if (item?.matcher?.value === name) {
      properties = item?.properties;
    }
  });
  return properties;
}

export default getOverridePropertiesByName;