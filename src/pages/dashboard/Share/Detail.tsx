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
import { useInterval } from 'ahooks';
import { useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useSelector } from 'react-redux';
import PageLayout from '@/components/pageLayout';
import { IRawTimeRange, getDefaultValue } from '@/components/TimeRangePicker';
import { Dashboard } from '@/store/dashboardInterface';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import {getDashboard, getDashboardPure} from '@/services/dashboardV2';
import VariableConfig, { IVariable } from '../VariableConfig';
import { ILink } from '../types';
import Panels from '../Panels';
import Title from './Title';
import { JSONParse } from '../utils';
import { sortPanelsByGridLayout } from '../Panels/utils';
import '../Detail/style.less';
import '../Detail/dark.antd.less';
import '../Detail/dark.less';

interface URLParam {
  id: string;
}

export const dashboardTimeCacheKey = 'dashboard-timeRangePicker-value';

export default function DetailV2() {
  const { search } = useLocation();
  const locationQuery = queryString.parse(search);
  if (_.get(locationQuery, '__cluster')) {
    localStorage.setItem('curCluster', _.get(locationQuery, '__cluster'));
  }
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
  const [,setDashboardLinks] = useState<ILink[]>();
  const [panels, setPanels] = useState<any[]>([]);
  const [range, setRange] = useState<IRawTimeRange>(
    getDefaultValue(dashboardTimeCacheKey, {
      start: 'now-1h',
      end: 'now',
    }),
  );
  const [step, setStep] = useState<number | null>(null);
  const [editable, setEditable] = useState(true);
  const [forceRenderKey, setForceRender] = useState(_.uniqueId('forceRenderKey_'));
  let updateAtRef = useRef<number>();
  const refresh = (cbk?: () => void) => {
    getDashboard(id).then((res) => {
      updateAtRef.current = res.update_at;
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
        if (cbk) {
          cbk();
        }
      }
    });
  };

  const handleVariableChange = (value, b, valueWithOptions) => {
    // 更新变量配置状态
    if (valueWithOptions) {
      setVariableConfigWithOptions(valueWithOptions);
    }
  };
  const stopAutoRefresh = () => {
    refreshRef.current?.closeRefresh();
  };

  useEffect(() => {
    refresh();
  }, [id]);

  useInterval(() => {
    if (import.meta.env.PROD) {
      getDashboardPure(id).then((res) => {
        if (updateAtRef.current && res.update_at > updateAtRef.current) {
          if (editable) setEditable(false);
        } else {
          setEditable(true);
        }
      });
    }
  }, 2000);

  return (
    <PageLayout
      customArea={
        <Title
          curCluster={curCluster}
          clusters={clusters}
          setCurCluster={setCurCluster}
          dashboard={dashboard}
          refresh={() => {
            // 集群修改需要刷新数据
            refresh(() => {
              // TODO: cluster 和 vars 目前没办法做到同步，暂时用定时器处理
              setTimeout(() => {
                setForceRender(_.uniqueId('forceRenderKey_'));
              }, 500);
            });
          }}
          range={range}
          setRange={(v) => {
            setRange(v);
          }}
          step={step}
          setStep={setStep}
        />
      }
    >
      <div>
        <div className='dashboard-detail-content'>
          <div className='dashboard-detail-content-header'>
            <div className='variable-area'>
              {variableConfig && <VariableConfig editable={false} onChange={handleVariableChange} value={variableConfig} cluster={curCluster} range={range} id={id} onOpenFire={stopAutoRefresh} />}
            </div>
          </div>
          {variableConfigWithOptions && (
            <Panels
              isPreview={true}
              key={forceRenderKey}
              editable={editable}
              panels={panels}
              setPanels={setPanels}
              curCluster={curCluster}
              dashboard={dashboard}
              range={range}
              step={step}
              variableConfig={variableConfigWithOptions}
              onShareClick={() => {}}
              onUpdated={(res) => {
                updateAtRef.current = res.update_at;
                refresh();
              }}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
