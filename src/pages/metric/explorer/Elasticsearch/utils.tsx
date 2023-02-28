import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

function localeCompareFunc(a, b) {
  return a.localeCompare(b);
}

export function getColumnsFromFields(selectedFields: string[], dateField?: string) {
  let columns: any[] = [];

  if (_.isEmpty(selectedFields)) {
    columns = [
      {
        title: 'Document',
        dataIndex: 'fields',

        render(text) {
          return (
            <dl className='event-logs-row'>
              {_.map(text, (val, key) => {
                return (
                  <React.Fragment key={key}>
                    <dt>{key}:</dt> <dd>{_.join(val, ',')}</dd>
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
          return (
            <div
              style={{
                minWidth: item.length * 8,
              }}
            >
              {fields[item]}
            </div>
          );
        },
        sorter: (a, b) => localeCompareFunc(_.join(_.get(a, `fields[${item}]`, '')), _.join(_.get(b, `fields[${item}]`, ''))),
      };
    });
  }

  if (dateField) {
    columns.unshift({
      title: 'Time',
      dataIndex: 'fields',
      width: 200,
      render: (fields) => {
        return fields[dateField];
      },
      sorter: (a, b) => {
        return localeCompareFunc(_.join(_.get(a, `fields[${dateField}]`, '')), _.join(_.get(b, `fields[${dateField}]`, '')));
      },
    });
  }

  return columns;
}
