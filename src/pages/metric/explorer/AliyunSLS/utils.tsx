import React from 'react';
import _ from 'lodash';
import moment from 'moment';

function localeCompareFunc(a, b) {
  return a.localeCompare(b);
}

export function getColumnsFromFields(selectedFields: string[], dateField?: string) {
  let columns: any[] = [];
  if (_.isEmpty(selectedFields)) {
    columns = [
      {
        title: 'Document',
        render(record) {
          return (
            <dl className='event-logs-row'>
              {_.map(record, (val, key) => {
                return (
                  <React.Fragment key={key}>
                    <dt>{key}:</dt> <dd>{val}</dd>
                  </React.Fragment>
                );
              })}
            </dl>
          );
        },
      },
    ];
  } else {
    columns = _.map(selectedFields, (item) => {
      return {
        title: item,
        dataIndex: 'fields',
        render: (fields) => {
          return _.join(fields[item], ',');
        },
        sorter: (a, b) => localeCompareFunc(_.join(_.get(a, `fields[${item}]`, '')), _.join(_.get(b, `fields[${item}]`, ''))),
      };
    });
  }
  if (dateField) {
    columns.unshift({
      title: 'Time',
      dataIndex: dateField,
      width: 200,
      render: (text) => {
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
      sorter: (a, b) => {
        return localeCompareFunc(_.join(_.get(a, `fields[${dateField}]`, '')), _.join(_.get(b, `fields[${dateField}]`, '')));
      },
    });
  }
  return columns;
}

export function getInnerTagKeys(log: { [index: string]: string }) {
  const innerFields: string[] = [];
  _.forEach(log, (_val, key) => {
    if (key.indexOf('__tag__') === 0) {
      innerFields.push(key);
    }
  });
  return innerFields;
}
