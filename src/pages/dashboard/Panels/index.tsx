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
import React, { useRef } from 'react';
import _ from 'lodash';
import semver from 'semver';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
import { useLocation } from 'react-router-dom';
import querystring from 'query-string';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Range } from '@/components/DateRangePicker';
import { updateDashboardConfigs } from '@/services/dashboardV2';
import { Dashboard } from '@/store/dashboardInterface';
import {
  buildLayout,
  sortPanelsByGridLayout,
  updatePanelsLayout,
  handleRowToggle,
  updatePanelsWithNewPanel,
  updatePanelsInsertNewPanel,
  panelsMergeToConfigs,
  updatePanelsInsertNewPanelToRow,
  getRowCollapsedPanels,
  getRowUnCollapsedPanels,
} from './utils';
import Renderer from '../Renderer/Renderer/index';
import Row from './Row';
import editor from '../Editor';
import './style.less';

interface IProps {
  curCluster: string;
  dashboard: Dashboard;
  range: Range;
  step: number | null;
  variableConfig: any;
  panels: any[];
  setPanels: (panels: any[]) => void;
  onShareClick: (panel: any) => void;
  onUpdated: () => void;
}

const ReactGridLayout = WidthProvider(RGL);

function index(props: IProps) {
  const location = useLocation();
  const { themeMode } = querystring.parse(location.search);
  const { curCluster, dashboard, range, step, variableConfig, panels, setPanels, onShareClick, onUpdated } = props;
  const layoutInitialized = useRef(false);
  const allowUpdateDashboardConfigs = useRef(false);
  const reactGridLayoutDefaultProps = {
    rowHeight: 40,
    cols: 24,
    useCSSTransforms: false,
    draggableHandle: '.dashboards-panels-item-drag-handle',
  };

  return (
    <div className='dashboards-panels scroll-container'>
      <ReactGridLayout
        layout={buildLayout(panels)}
        onLayoutChange={(layout) => {
          if (layoutInitialized.current) {
            const newPanels = sortPanelsByGridLayout(updatePanelsLayout(panels, layout));
            if (!_.isEqual(panels, newPanels)) {
              setPanels(newPanels);
              // TODO: 这里可能会触发两次 update, 删除、克隆面板后可能会触发 layoutChange，此时需要更新面板重新更新下 dashboard 配置
              if (allowUpdateDashboardConfigs.current) {
                allowUpdateDashboardConfigs.current = false;
                updateDashboardConfigs(dashboard.id, {
                  configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                }).then(() => {
                  onUpdated();
                });
              }
            }
          }
          layoutInitialized.current = true;
        }}
        onDragStop={(layout) => {
          const newPanels = sortPanelsByGridLayout(updatePanelsLayout(panels, layout));
          if (!_.isEqual(panels, newPanels)) {
            updateDashboardConfigs(dashboard.id, {
              configs: panelsMergeToConfigs(dashboard.configs, newPanels),
            }).then(() => {
              onUpdated();
            });
          }
        }}
        onResizeStop={(layout) => {
          const newPanels = sortPanelsByGridLayout(updatePanelsLayout(panels, layout));
          if (!_.isEqual(panels, newPanels)) {
            updateDashboardConfigs(dashboard.id, {
              configs: panelsMergeToConfigs(dashboard.configs, newPanels),
            }).then(() => {
              onUpdated();
            });
          }
        }}
        {...reactGridLayoutDefaultProps}
      >
        {_.map(panels, (item) => {
          return (
            <div key={item.layout.i} data-id={item.layout.i}>
              {item.type !== 'row' ? (
                semver.valid(item.version) ? (
                  <Renderer
                    themeMode={themeMode as 'dark'}
                    dashboardId={_.toString(dashboard.id)}
                    id={item.id}
                    time={range}
                    step={step}
                    type={item.type}
                    values={item as any}
                    variableConfig={variableConfig}
                    onCloneClick={() => {
                      const newPanels = updatePanelsInsertNewPanel(panels, {
                        ...item,
                        id: uuidv4(),
                        layout: {
                          ...item.layout,
                          i: uuidv4(),
                        },
                      });
                      setPanels(newPanels);
                      // 克隆面板必然会触发 layoutChange，更新 dashboard 放到 onLayoutChange 里面处理
                      allowUpdateDashboardConfigs.current = true;
                    }}
                    onShareClick={() => {
                      onShareClick(item);
                    }}
                    onEditClick={() => {
                      editor({
                        visible: true,
                        variableConfigWithOptions: variableConfig,
                        cluster: curCluster,
                        id: item.id,
                        initialValues: {
                          ...item,
                          id: item.id,
                        },
                        onOK: (values) => {
                          const newPanels = updatePanelsWithNewPanel(panels, values);
                          setPanels(newPanels);
                          updateDashboardConfigs(dashboard.id, {
                            configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                          }).then(() => {
                            onUpdated();
                          });
                        },
                      });
                    }}
                    onDeleteClick={() => {
                      Modal.confirm({
                        title: `是否删除图表：${item.name}`,
                        onOk: async () => {
                          const newPanels = _.filter(panels, (panel) => panel.id !== item.id);
                          allowUpdateDashboardConfigs.current = true;
                          setPanels(newPanels);
                          updateDashboardConfigs(dashboard.id, {
                            configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                          }).then(() => {
                            onUpdated();
                          });
                        },
                      });
                    }}
                  />
                ) : (
                  <div className='dashboards-panels-item-invalid'>
                    <div>
                      <div>无效的图表配置</div>
                      <a
                        onClick={() => {
                          const newPanels = _.filter(panels, (panel) => panel.id !== item.id);
                          allowUpdateDashboardConfigs.current = true;
                          setPanels(newPanels);
                          updateDashboardConfigs(dashboard.id, {
                            configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                          }).then(() => {
                            onUpdated();
                          });
                        }}
                      >
                        删除
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <Row
                  name={item.name}
                  row={item}
                  onToggle={() => {
                    const newPanels = handleRowToggle(!item.collapsed, panels, _.cloneDeep(item));
                    setPanels(newPanels);
                    updateDashboardConfigs(dashboard.id, {
                      configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                    }).then(() => {
                      onUpdated();
                    });
                  }}
                  onAddClick={() => {
                    editor({
                      visible: true,
                      variableConfigWithOptions: variableConfig,
                      cluster: curCluster,
                      id: item.id,
                      initialValues: {
                        type: 'timeseries',
                        targets: [
                          {
                            refId: 'A',
                            expr: '',
                          },
                        ],
                      },
                      onOK: (values) => {
                        const newPanels = updatePanelsInsertNewPanelToRow(panels, item.id, values);
                        setPanels(newPanels);
                        updateDashboardConfigs(dashboard.id, {
                          configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                        }).then(() => {
                          onUpdated();
                        });
                      },
                    });
                  }}
                  onEditClick={(newPanel) => {
                    const newPanels = updatePanelsWithNewPanel(panels, newPanel);
                    setPanels(newPanels);
                    updateDashboardConfigs(dashboard.id, {
                      configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                    }).then(() => {
                      onUpdated();
                    });
                  }}
                  onDeleteClick={(mode: 'self' | 'withPanels') => {
                    let newPanels: any[] = _.cloneDeep(panels);
                    if (mode === 'self') {
                      newPanels = getRowCollapsedPanels(newPanels, item);
                      newPanels = _.filter(newPanels, (panel) => panel.id !== item.id);
                    } else {
                      newPanels = getRowUnCollapsedPanels(newPanels, item);
                      newPanels = _.filter(newPanels, (panel) => panel.id !== item.id);
                    }
                    allowUpdateDashboardConfigs.current = true;
                    setPanels(newPanels);
                    updateDashboardConfigs(dashboard.id, {
                      configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                    }).then(() => {
                      onUpdated();
                    });
                  }}
                />
              )}
            </div>
          );
        })}
      </ReactGridLayout>
    </div>
  );
}

export default React.memo(index);
