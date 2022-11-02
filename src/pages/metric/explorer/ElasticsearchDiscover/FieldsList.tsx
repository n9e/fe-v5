import React from 'react';
import _ from 'lodash';
import { Tag } from 'antd';
import { DownOutlined, RightOutlined, PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface IProps {
  style?: React.CSSProperties;
  fieldsSearch?: string;
  fields: string[];
  type: 'selected' | 'available';
  onSelect?: (field: string) => void;
  onRemove?: (field: string) => void;
}

const titleMap = {
  selected: '已选字段',
  available: '可选字段',
};

const operIconMap = {
  selected: <CloseCircleOutlined />,
  available: <PlusCircleOutlined />,
};

export default function FieldsList(props: IProps) {
  const { style = {}, fieldsSearch, fields, type, onSelect, onRemove } = props;
  const [expanded, setExpanded] = React.useState<boolean>(true);
  const filteredFields = _.filter(fields, (field) => {
    if (fieldsSearch) {
      return field.indexOf(fieldsSearch) > -1;
    }
    return true;
  });

  if ((!_.isEmpty(filteredFields) && type === 'selected') || type === 'available') {
    return (
      <div
        style={{
          ...style,
        }}
      >
        <div
          className='es-discover-fields-title'
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <span>
            {expanded ? <DownOutlined /> : <RightOutlined />} {titleMap[type]}
          </span>
          <span>
            <Tag color={fieldsSearch ? '#6C53B1' : ''}>{filteredFields.length}</Tag>
          </span>
        </div>
        {expanded &&
          _.map(filteredFields, (item) => {
            return (
              <div className='es-discover-fields-item' key={item}>
                <span>{item}</span>
                <span
                  className='es-discover-fields-item-oper'
                  onClick={() => {
                    if (type === 'selected' && onRemove) {
                      onRemove(item);
                    } else if (type === 'available' && onSelect) {
                      onSelect(item);
                    }
                  }}
                >
                  {operIconMap[type]}
                </span>
              </div>
            );
          })}
      </div>
    );
  }
  return null;
}
