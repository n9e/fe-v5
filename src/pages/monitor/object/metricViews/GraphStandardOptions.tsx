import React from 'react';
import _ from 'lodash';
import { Menu, Checkbox, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface IProps {
  highLevelConfig: any;
  setHighLevelConfig: (val: any) => void;
}

const utils = [
  {
    label: 'none',
    value: 'none',
  },
  {
    label: 'bits(SI)',
    value: 'bitsSI',
  },
  {
    label: 'bytes(SI)',
    value: 'bytesSI',
  },
  {
    label: 'bits(IEC)',
    value: 'bitsIEC',
  },
  {
    label: 'bytes(IEC)',
    value: 'bytesIEC',
  },
  {
    label: '百分比(0-100)',
    value: 'percent',
  },
  {
    label: '百分比(0.0-1.0)',
    value: 'percentUnit',
  },
  {
    label: 'seconds',
    value: 'seconds',
  },
  {
    label: 'milliseconds',
    value: 'milliseconds',
  },
  {
    label: 'humanize(seconds)',
    value: 'humantimeSeconds',
  },
  {
    label: 'humanize(milliseconds)',
    value: 'humantimeMilliseconds',
  },
];

export default function GraphStandardOptions(props: IProps) {
  const { highLevelConfig, setHighLevelConfig } = props;
  const aggrFuncMenu = (
    <Menu
      onClick={(sort) => {
        setHighLevelConfig({ ...highLevelConfig, sharedSortDirection: (sort as { key: 'desc' | 'asc' }).key });
      }}
      selectedKeys={[highLevelConfig.sharedSortDirection]}
    >
      <Menu.Item key='desc'>desc</Menu.Item>
      <Menu.Item key='asc'>asc</Menu.Item>
    </Menu>
  );
  const precisionMenu = (
    <Menu
      onClick={(e) => {
        setHighLevelConfig({ ...highLevelConfig, util: e.key });
      }}
      selectedKeys={[highLevelConfig.util]}
    >
      {_.map(utils, (item) => {
        return <Menu.Item key={item.value}>{item.label}</Menu.Item>;
      })}
    </Menu>
  );
  return (
    <div>
      <Checkbox
        checked={highLevelConfig.shared}
        onChange={(e) => {
          setHighLevelConfig({ ...highLevelConfig, shared: e.target.checked });
        }}
      >
        Multi Series in Tooltip, order value
      </Checkbox>
      <Dropdown overlay={aggrFuncMenu}>
        <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
          {highLevelConfig.sharedSortDirection} <DownOutlined />
        </a>
      </Dropdown>
      <br />
      <Checkbox
        checked={highLevelConfig.legend}
        onChange={(e) => {
          setHighLevelConfig({ ...highLevelConfig, legend: e.target.checked });
        }}
      >
        Show Legend
      </Checkbox>
      <br />
      Value format with:{' '}
      <Dropdown overlay={precisionMenu}>
        <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
          {_.get(_.find(utils, { value: highLevelConfig.util }), 'label')} <DownOutlined />
        </a>
      </Dropdown>
    </div>
  );
}
