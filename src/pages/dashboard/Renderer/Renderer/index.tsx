/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { useInViewport } from 'ahooks';
import { Dropdown, Menu, Tooltip } from 'antd';
import { InfoCircleOutlined, MoreOutlined, LinkOutlined, SettingOutlined, ShareAltOutlined, DeleteOutlined, CopyOutlined, SyncOutlined } from '@ant-design/icons';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import Timeseries from './Timeseries';
import Stat from './Stat';
import Table from './Table';
import Pie from './Pie';
import Hexbin from './Hexbin';
import BarGauge from './BarGauge';
import Text from './Text';
import { IVariable } from '../../VariableConfig/definition';
import Markdown from '../../Editor/Components/Markdown';
import usePrometheus from '../datasource/usePrometheus';
import { IPanel } from '../../types';
import { getStepByTimeAndStep } from '../../utils';
import './style.less';

interface IProps {
  themeMode?: 'dark';
  dashboardId: string;
  id?: string;
  time: IRawTimeRange;
  step: number | null;
  type: string;
  values: IPanel;
  variableConfig?: IVariable[];
  isPreview?: boolean; // 是否是预览，预览中不显示编辑和分享
  onCloneClick?: () => void;
  onShareClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function index(props: IProps) {
  const { themeMode, dashboardId, id, step, type, variableConfig, isPreview, onCloneClick, onShareClick, onEditClick, onDeleteClick } = props;
  const [time, setTime] = useState(props.time);
  const [visible, setVisible] = useState(false);
  const values = _.cloneDeep(props.values);
  const ref = useRef<HTMLDivElement>(null);
  const [inViewPort] = useInViewport(ref);
  const { series, loading } = usePrometheus({
    id,
    dashboardId,
    time,
    step,
    targets: values.targets,
    variableConfig,
    inViewPort: isPreview || inViewPort,
  });
  const tipsVisible = values.description || !_.isEmpty(values.links);

  useEffect(() => {
    setTime(props.time);
  }, [JSON.stringify(props.time)]);

  if (_.isEmpty(values)) return null;

  // TODO: 如果 hexbin 的 colorRange 为 string 时转成成 array
  if (typeof _.get(values, 'custom.colorRange') === 'string') {
    _.set(values, 'custom.colorRange', _.split(_.get(values, 'custom.colorRange'), ','));
  }
  const subProps = {
    values,
    series,
  };
  const RendererCptMap = {
    timeseries: () => <Timeseries {...subProps} themeMode={themeMode} />,
    stat: () => <Stat {...subProps} containerRef={ref} themeMode={themeMode} />,
    table: () => <Table {...subProps} themeMode={themeMode} />,
    pie: () => <Pie {...subProps} themeMode={themeMode} />,
    hexbin: () => <Hexbin {...subProps} themeMode={themeMode} />,
    barGauge: () => <BarGauge {...subProps} themeMode={themeMode} />,
    text: () => <Text {...subProps} />,
  };

  return (
    <div
      className={classNames({
        'renderer-container': true,
        'renderer-container-no-title': !values.name,
      })}
      ref={ref}
    >
      <div className='renderer-header graph-header dashboards-panels-item-drag-handle'>
        <div className='renderer-header-desc'>
          {tipsVisible ? (
            <Tooltip
              placement='top'
              overlayInnerStyle={{
                width: 300,
              }}
              getPopupContainer={() => ref.current!}
              title={
                <div>
                  <Markdown content={values.description} />
                  {_.map(values.links, (link, i) => {
                    return (
                      <div key={i}>
                        <a href={link.url} target={link.targetBlank ? '_blank' : '_self'}>
                          {link.title}
                        </a>
                      </div>
                    );
                  })}
                </div>
              }
            >
              <div className='renderer-header-desc'>{values.description ? <InfoCircleOutlined /> : <LinkOutlined />}</div>
            </Tooltip>
          ) : null}
        </div>
        <div className='renderer-header-content'>
          <Tooltip title={values.name} getPopupContainer={() => ref.current!}>
            <div className='renderer-header-title'>{values.name}</div>
          </Tooltip>
        </div>
        <div className='renderer-header-loading'>
          {loading ? (
            <SyncOutlined spin />
          ) : (
            !isPreview && (
              <Dropdown
                trigger={['click']}
                placement='bottomCenter'
                getPopupContainer={() => ref.current!}
                overlayStyle={{
                  minWidth: '100px',
                }}
                visible={visible}
                onVisibleChange={(visible) => {
                  setVisible(visible);
                }}
                overlay={
                  <Menu>
                    <Menu.Item
                      onClick={() => {
                        setVisible(true);
                        setTime({
                          ...time,
                          refreshFlag: _.uniqueId('refreshFlag_ '),
                        });
                      }}
                      key='0'
                    >
                      <Tooltip title={`刷新间隔小于 step(${getStepByTimeAndStep(time, step)}s) 将不会更新数据`} placement='left'>
                        <div>
                          <SyncOutlined style={{ marginRight: 8 }} />
                          刷新
                        </div>
                      </Tooltip>
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        setVisible(false);
                        if (onEditClick) onEditClick();
                      }}
                      key='1'
                    >
                      <SettingOutlined style={{ marginRight: 8 }} />
                      编辑
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        setVisible(false);
                        if (onCloneClick) onCloneClick();
                      }}
                      key='2'
                    >
                      <CopyOutlined style={{ marginRight: 8 }} />
                      克隆
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        setVisible(false);
                        if (onShareClick) onShareClick();
                      }}
                      key='3'
                    >
                      <ShareAltOutlined style={{ marginRight: 8 }} />
                      分享
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        setVisible(false);
                        if (onDeleteClick) onDeleteClick();
                      }}
                      key='4'
                    >
                      <DeleteOutlined style={{ marginRight: 8 }} />
                      删除
                    </Menu.Item>
                  </Menu>
                }
              >
                <MoreOutlined className='renderer-header-more' />
              </Dropdown>
            )
          )}
        </div>
      </div>
      <div className='renderer-body' style={{ height: values.name ? `calc(100% - 47px)` : '100%' }}>
        {RendererCptMap[type] ? RendererCptMap[type]() : <div className='unknown-type'>{`无效的图表类型 ${type}`}</div>}
      </div>
    </div>
  );
}

export default React.memo(index);
