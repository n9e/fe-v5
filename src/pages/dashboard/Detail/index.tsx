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
import React, { useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageLayout from '@/components/pageLayout';
import { Range } from '@/components/DateRangePicker';
import { Dashboard } from '@/store/dashboardInterface';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getDashboard, updateDashboardConfigs } from '@/services/dashboardV2';
import { SetTmpChartData } from '@/services/metric';
import VariableConfig, { IVariable } from '../VariableConfig';
import { replaceExpressionVars } from '../VariableConfig/constant';
import { ILink } from '../types';
import DashboardLinks from '../DashboardLinks';
import Panels from '../Panels';
import Title from './Title';
import { JSONParse } from '../utils';
import editor from '../Editor';
import { defaultCustomValuesMap } from '../Editor/config';
import { sortPanelsByGridLayout, panelsMergeToConfigs, updatePanelsInsertNewPanelToGlobal } from '../Panels/utils';
import './style.less';
import './dark.antd.less';
import './dark.less';

interface URLParam {
  id: string;
}

export default function DetailV2() {
  const localCluster = localStorage.getItem('curCluster');
  const { id } = useParams<URLParam>();
  const refreshRef = useRef<{ closeRefresh: Function }>();
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const [curCluster, setCurCluster] = useState<string>(localCluster || clusters[0]);
  const [dashboard, setDashboard] = useState<Dashboard>({
    create_by: '',
    favorite: 0,
    id: 0,
    name: '',
    tags: '',
    update_at: 0,
    update_by: '',
  });
  const [variableConfig, setVariableConfig] = useState<IVariable[]>();
  const [variableConfigWithOptions, setVariableConfigWithOptions] = useState<IVariable[]>();
  const [dashboardLinks, setDashboardLinks] = useState<ILink[]>();
  const [panels, setPanels] = useState<any[]>([]);
  const [range, setRange] = useState<Range>({
    unit: 'hours',
    num: 6,
    description: '',
  });
  const [step, setStep] = useState<number | null>(null);
  const refresh = () => {
    getDashboard(id).then((res) => {
      setDashboard(res);
      if (res.configs) {
        const configs = JSONParse(res.configs);
        // TODO: configs 中可能没有 var 属性会导致 VariableConfig 报错
        const variableConfig = configs.var
          ? configs
          : {
              ...configs,
              var: [],
            };
        setVariableConfig(
          _.map(variableConfig.var, (item) => {
            return _.omit(item, 'options'); // 兼容性代码，去除掉已保存的 options
          }),
        );
        setDashboardLinks(configs.links);
        setPanels(sortPanelsByGridLayout(configs.panels));
      }
    });
  };
  const handleUpdateDashboardConfigs = (id, configs) => {
    updateDashboardConfigs(id, configs).then(() => {
      refresh();
    });
  };
  const handleVariableChange = (value, b, valueWithOptions) => {
    const dashboardConfigs: any = JSONParse(dashboard.configs);
    dashboardConfigs.var = value;
    b && handleUpdateDashboardConfigs(id, { configs: JSON.stringify(dashboardConfigs) });
    valueWithOptions && setVariableConfigWithOptions(valueWithOptions);
  };
  const stopAutoRefresh = () => {
    refreshRef.current?.closeRefresh();
  };

  useEffect(() => {
    refresh();
  }, [id]);

  return (
    <PageLayout
      customArea={
        <Title
          curCluster={curCluster}
          clusters={clusters}
          setCurCluster={setCurCluster}
          dashboard={dashboard}
          setDashboard={setDashboard}
          refresh={(flag) => {
            // 集群修改需要刷新数据
            if (flag) {
              refresh();
            }
          }}
          range={range}
          setRange={setRange}
          step={step}
          setStep={setStep}
          refreshRef={refreshRef}
          onAddPanel={(type) => {
            if (type === 'row') {
              const newPanels = updatePanelsInsertNewPanelToGlobal(
                panels,
                {
                  type: 'row',
                  id: uuidv4(),
                  name: '分组',
                  collapsed: true,
                },
                'row',
              );
              setPanels(newPanels);
              handleUpdateDashboardConfigs(dashboard.id, {
                configs: panelsMergeToConfigs(dashboard.configs, newPanels),
              });
            } else {
              editor({
                visible: true,
                variableConfigWithOptions,
                cluster: curCluster,
                id,
                initialValues: {
                  type,
                  targets: [
                    {
                      refId: 'A',
                      expr: '',
                    },
                  ],
                  custom: defaultCustomValuesMap[type],
                },
                onOK: (values) => {
                  const newPanels = updatePanelsInsertNewPanelToGlobal(panels, values, 'chart');
                  setPanels(newPanels);
                  handleUpdateDashboardConfigs(dashboard.id, {
                    configs: panelsMergeToConfigs(dashboard.configs, newPanels),
                  });
                },
              });
            }
          }}
        />
      }
    >
      <div>
        <div className='dashboard-detail-content'>
          <div className='dashboard-detail-content-header'>
            <div className='variable-area'>
              <VariableConfig onChange={handleVariableChange} value={variableConfig} cluster={curCluster} range={range} id={id} onOpenFire={stopAutoRefresh} />
            </div>
            <DashboardLinks
              value={dashboardLinks}
              onChange={(v) => {
                const dashboardConfigs: any = JSONParse(dashboard.configs);
                dashboardConfigs.links = v;
                handleUpdateDashboardConfigs(id, {
                  configs: JSON.stringify(dashboardConfigs),
                });
                setDashboardLinks(v);
              }}
            />
          </div>
          {variableConfigWithOptions && (
            <Panels
              panels={panels}
              setPanels={setPanels}
              curCluster={curCluster}
              dashboard={dashboard}
              range={range}
              step={step}
              variableConfig={variableConfigWithOptions}
              onShareClick={(panel) => {
                const serielData = {
                  dataProps: {
                    ...panel,
                    targets: _.map(panel.targets, (target) => {
                      const realExpr = variableConfigWithOptions
                        ? replaceExpressionVars(target.expr, variableConfigWithOptions, variableConfigWithOptions.length, id)
                        : target.expr;
                      return {
                        ...target,
                        expr: realExpr,
                      };
                    }),
                    step,
                    range,
                  },
                  curCluster: localStorage.getItem('curCluster'),
                };
                SetTmpChartData([
                  {
                    configs: JSON.stringify(serielData),
                  },
                ]).then((res) => {
                  const ids = res.dat;
                  window.open('/chart/' + ids);
                });
              }}
              onUpdated={() => {
                refresh();
              }}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
