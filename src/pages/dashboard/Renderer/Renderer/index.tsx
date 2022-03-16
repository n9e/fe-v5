import React from 'react';
import _ from 'lodash';
import { Dropdown, Menu, Tooltip } from 'antd';
import { InfoOutlined, DownOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Range } from '@/components/DateRangePicker';
import Timeseries from './Timeseries';
import Stat from './Stat';
import Table from './Table';
import { VariableType } from '../../VariableConfig';
import Markdown from '../../Editor/Components/Markdown';
import './style.less';

interface IProps {
  time: Range;
  step: number | null;
  type: string;
  values: any;
  variableConfig?: VariableType;
}

function index(props: IProps) {
  const { time, step, type, variableConfig, values } = props;
  const subProps = {
    time,
    step,
    variableConfig,
    values,
  };
  if (_.isEmpty(values)) return null;
  const RendererCptMap = {
    timeseries: <Timeseries {...subProps} />,
    stat: <Stat {...subProps} />,
    table: <Table {...subProps} />,
  };
  return (
    <div className='renderer-container' style={{ border: '1px solid #d9d9d9', height: 300 }}>
      <div className='renderer-header'>
        {values.description ? (
          <Tooltip placement='rightTop' title={<Markdown content={values.description} />}>
            <div className='renderer-header-desc'>
              <InfoOutlined />
            </div>
          </Tooltip>
        ) : null}
        <div className='renderer-header-content'>
          <Dropdown
            trigger={['click']}
            placement='bottomCenter'
            overlayStyle={{
              minWidth: '100px',
            }}
            overlay={
              <Menu>
                <Menu.Item>
                  <ShareAltOutlined />
                  分享
                </Menu.Item>
              </Menu>
            }
          >
            <div className='renderer-header-title'>
              {values.name}
              <DownOutlined className='renderer-header-arrow' />
            </div>
          </Dropdown>
        </div>
      </div>
      {RendererCptMap[type] || `无效的图表类型 ${type}`}
    </div>
  );
}

export default index;
