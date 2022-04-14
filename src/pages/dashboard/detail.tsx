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
import { useParams, useHistory } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import semver from 'semver';
import { useThrottleFn } from 'ahooks';
import PageLayout from '@/components/pageLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { useSelector, useDispatch } from 'react-redux';
import { ReloadOutlined, RollbackOutlined, EditOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Input, Form, Modal, Dropdown, message, Menu, Space } from 'antd';
import { Range } from '@/components/DateRangePicker';
import { getSingleDashboard, updateSingleDashboard, createChartGroup, getChartGroup, delChartGroup, removeChart, updateChartGroup, createChart } from '@/services/dashboard';
import { SetTmpChartData } from '@/services/metric';
import { Dashboard, Group } from '@/store/dashboardInterface';
import ChartGroup, { Chart } from './chartGroup';
import ChartConfigModal from './chartConfigModal';
import RefreshIcon from '@/components/RefreshIcon';
import VariableConfig, { VariableType } from './VariableConfig';
import './index.less';
import { useTranslation } from 'react-i18next';
import Resolution from '@/components/Resolution';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import editor from './Editor';
import { replaceExpressionVars } from './VariableConfig/constant';
import Refresh from './Components/Refresh';
import DashboardLinks from './DashboardLinks';
import { ILink } from './types';

interface URLParam {
  id: string;
  busiId: string;
}
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
};
let groupId: number;
let isAddGroup: boolean = true;
export default function DashboardDetail() {
  const refreshRef = useRef<{ closeRefresh: Function }>();
  const { t } = useTranslation();
  const { id, busiId } = useParams<URLParam>();
  const [groupForm] = Form.useForm();
  const history = useHistory();
  const Ref = useRef<any>(null);
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const localCluster = localStorage.getItem('curCluster');
  const [curCluster, setCurCluster] = useState<string>(localCluster || clusters[0]);
  if (!localCluster && clusters.length > 0) {
    setCurCluster(clusters[0]);
    localStorage.setItem('curCluster', clusters[0]);
  }
  const [dashboard, setDashboard] = useState<Dashboard>({
    create_by: '',
    favorite: 0,
    id: 0,
    name: '',
    tags: '',
    update_at: 0,
    update_by: '',
  });
  const [step, setStep] = useState<number | null>(null);
  const [titleEditing, setTitleEditing] = useState(false);
  const [chartGroup, setChartGroup] = useState<Group[]>([]);
  const [variableConfig, setVariableConfig] = useState<VariableType>();
  const [variableConfigWithOptions, setVariableConfigWithOptions] = useState<VariableType>();
  const [dashboardLinks, setDashboardLinks] = useState<ILink[]>();
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [chartModalVisible, setChartModalVisible] = useState(false);
  const [chartModalInitValue, setChartModalInitValue] = useState<Chart | null>();
  const [range, setRange] = useState<Range>({
    start: 0,
    end: 0,
  });
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const { run } = useThrottleFn(
    () => {
      if ('start' in range && range.start && range.end) {
        const diff = range.end - range.start;
        const now = moment().unix();
        setRange({
          end: now,
          start: now - diff,
        });
      } else if ('unit' in range && range.unit) {
        const newRefreshFlag = _.uniqueId('refreshFlag_');
        setRange({
          ...range,
          refreshFlag: newRefreshFlag,
        });
        setRefreshFlag(newRefreshFlag);
      }
      init(false);
    },
    { wait: 1000 },
  );

  useEffect(() => {
    init();
  }, []);

  const init = (needUpdateVariable = true) => {
    getSingleDashboard(busiId, id).then((res) => {
      setDashboard(res.dat);
      if (res.dat.configs) {
        const configs = JSON.parse(res.dat.configs);
        setVariableConfig(configs);
        setVariableConfigWithOptions(configs);
        setDashboardLinks(configs.links);
      }
    });
    getChartGroup(busiId, id).then((res) => {
      let arr = res.dat || [];
      setChartGroup(
        arr
          .sort((a, b) => a - b)
          .map((item) => {
            item.updateTime = Date.now(); // 前端拓展一个更新时间字段，用来主动刷新ChartGroup
            return item;
          }),
      );
    });
  };

  const handleDateChange = (e) => {
    setRange(e);
  };

  const handleEdit = () => {
    setTitleEditing(!titleEditing);
  };

  const handleModifyTitle = async (e) => {
    await updateSingleDashboard(busiId, id, { ...dashboard, name: e.target.value });
    // await init();
    setDashboard({ ...dashboard, name: e.target.value });
    setTitleEditing(false);
  };

  const handleAddChart = (gid: number) => {
    groupId = gid;
    editor({
      visible: true,
      variableConfig: variableConfigWithOptions,
      cluster: curCluster,
      busiId,
      groupId,
      id,
      initialValues: {
        type: 'timeseries',
        targets: [
          {
            refId: 'A',
            expr: '',
          },
        ],
      },
      onOK: () => {
        handleChartConfigVisibleChange(true);
      },
    });
    // setChartModalVisible(true);
  }; //group是为了让detail组件知道当前需要刷新的是哪个chartGroup，item是为了获取待编辑的信息

  const handleUpdateChart = (group: Group, item: Chart) => {
    groupId = group.id;
    setChartModalInitValue(item);

    if (semver.valid(item.configs.version)) {
      editor({
        visible: true,
        variableConfig,
        cluster: curCluster,
        busiId,
        groupId,
        id,
        initialValues: {
          ...item.configs,
          id: item.id,
        },
        onOK: () => {
          handleChartConfigVisibleChange(true);
        },
      });
    } else {
      setChartModalVisible(true);
    }
  };

  const handleDelChart = async (group: Group, item: Chart) => {
    groupId = group.id;
    await removeChart(busiId, item.id as any);
    refreshUpdateTimeByChartGroupId();
  };

  const handleCloneChart = async (group: Group, item: Chart) => {
    groupId = group.id;
    const configsClone = _.cloneDeep(item.configs);
    configsClone.layout = {
      w: configsClone.layout.w,
      h: configsClone.layout.h,
    };
    await createChart(busiId, {
      configs: JSON.stringify(configsClone),
      weight: 0,
      group_id: groupId,
    });
    refreshUpdateTimeByChartGroupId();
  };

  const handleShareChart = async (group: Group, item: any) => {
    const serielData = {
      dataProps: {
        ...item.configs,
        targets: _.map(item.configs.targets, (target) => {
          const realExpr = variableConfigWithOptions ? replaceExpressionVars(target.expr, variableConfigWithOptions, variableConfigWithOptions.var.length, id) : target.expr;
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
  };

  const handleAddOrUpdateChartGroup = async () => {
    await groupForm.validateFields();
    let obj = groupForm.getFieldsValue();

    if (isAddGroup) {
      let weightArr = chartGroup.map((item) => item.weight);
      let weight = Math.max(...weightArr) + 1;
      await createChartGroup(busiId, { ...obj, weight, dashboard_id: Number(id) });
    } else {
      let group = chartGroup.find((item) => item.id === groupId);
      await updateChartGroup(busiId, [{ dashboard_id: Number(id), ...group, ...obj }]);
    }

    init();
    isAddGroup = true;
    setGroupModalVisible(false);
  };

  const handleUpdateChartGroup = (group: Group) => {
    groupId = group.id;
    isAddGroup = false;
    groupForm.setFieldsValue({ name: group.name });
    setGroupModalVisible(true);
  };

  const handleMoveUpChartGroup = async (group: Group) => {
    const { weight } = group;
    let lessWeightGroup = chartGroup.find((item) => item.weight === weight - 1);
    if (!lessWeightGroup) return;
    lessWeightGroup.weight = weight;
    group.weight = weight - 1;
    await updateChartGroup(busiId, [lessWeightGroup, group]);
    init();
  };

  const handleMoveDownChartGroup = async (group: Group) => {
    const { weight } = group;
    let lessWeightGroup = chartGroup.find((item) => item.weight === weight + 1);
    if (!lessWeightGroup) return;
    lessWeightGroup.weight = weight;
    group.weight = weight + 1;
    await updateChartGroup(busiId, [lessWeightGroup, group]);
    init();
  };

  const handleDelChartGroup = async (id: number) => {
    await delChartGroup(busiId, id);
    message.success(t('删除分组成功'));
    init();
    setGroupModalVisible(false);
  };

  const refreshUpdateTimeByChartGroupId = () => {
    let groupIndex = chartGroup.findIndex((item) => item.id === groupId);
    if (groupIndex < 0) return;
    let newChartGroup = [...chartGroup];
    newChartGroup[groupIndex].updateTime = Date.now();
    setChartGroup(newChartGroup);
  };

  const handleChartConfigVisibleChange = (b) => {
    setChartModalVisible(false);
    setChartModalInitValue(null);
    b && refreshUpdateTimeByChartGroupId();
  };

  const handleVariableChange = (value, b, valueWithOptions) => {
    let dashboardConfigs: any = {};
    try {
      if (dashboard.configs) {
        dashboardConfigs = JSON.parse(dashboard.configs);
      }
    } catch (e) {
      console.error(e);
    }
    dashboardConfigs.var = value.var;
    b && updateSingleDashboard(busiId, id, { ...dashboard, configs: JSON.stringify(dashboardConfigs) });
    setVariableConfig(dashboardConfigs);
    setVariableConfigWithOptions(valueWithOptions);
  };

  const stopAutoRefresh = () => {
    refreshRef.current?.closeRefresh();
  };
  const clusterMenu = (
    <Menu selectedKeys={[curCluster]}>
      {clusters.map((cluster) => (
        <Menu.Item
          key={cluster}
          onClick={(_) => {
            setCurCluster(cluster);
            localStorage.setItem('curCluster', cluster);
            init();
          }}
        >
          {cluster}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <PageLayout
      customArea={
        <div className='dashboard-detail-header'>
          <div className='dashboard-detail-header-left'>
            <RollbackOutlined className='back' onClick={() => history.push('/dashboards')} />
            {titleEditing ? <Input ref={Ref} defaultValue={dashboard.name} onPressEnter={handleModifyTitle} /> : <div className='title'>{dashboard.name}</div>}
            {!titleEditing ? (
              <EditOutlined className='edit' onClick={handleEdit} />
            ) : (
              <>
                <Button size='small' style={{ marginRight: 5, marginLeft: 5 }} onClick={() => setTitleEditing(false)}>
                  取消
                </Button>
                <Button
                  size='small'
                  type='primary'
                  onClick={() => {
                    handleModifyTitle({ target: { value: Ref.current.state.value } });
                  }}
                >
                  保存
                </Button>
              </>
            )}
          </div>
          <div className='dashboard-detail-header-right'>
            <Space>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                集群：
                <Dropdown overlay={clusterMenu}>
                  <Button>
                    {curCluster} <DownOutlined />
                  </Button>
                </Dropdown>
              </div>
              <DateRangePicker onChange={handleDateChange} />
              <Resolution onChange={(v) => setStep(v)} initialValue={step} />
              <Refresh onRefresh={run} ref={refreshRef} />
            </Space>
          </div>
        </div>
      }
    >
      <div className='dashboard-detail-content'>
        <div className='dashboard-detail-content-header'>
          <div className='variable-area'>
            <VariableConfig onChange={handleVariableChange} value={variableConfig} cluster={curCluster} range={range} id={id} onOpenFire={stopAutoRefresh} />
          </div>
          <DashboardLinks
            value={dashboardLinks}
            onChange={(v) => {
              let dashboardConfigs: any = {};
              try {
                if (dashboard.configs) {
                  dashboardConfigs = JSON.parse(dashboard.configs);
                }
              } catch (e) {
                console.error(e);
              }
              dashboardConfigs.links = v;
              updateSingleDashboard(busiId, id, {
                ...dashboard,
                configs: JSON.stringify(dashboardConfigs),
              });
              setDashboardLinks(v);
            }}
          />
        </div>

        <div className='charts'>
          {chartGroup.map((item, i) => (
            <ChartGroup
              id={id}
              cluster={curCluster}
              busiId={busiId}
              key={i}
              step={step}
              groupInfo={item}
              onAddChart={handleAddChart}
              onUpdateChart={handleUpdateChart}
              onCloneChart={handleCloneChart}
              onShareChart={handleShareChart}
              onUpdateChartGroup={handleUpdateChartGroup}
              onMoveUpChartGroup={handleMoveUpChartGroup}
              onMoveDownChartGroup={handleMoveDownChartGroup}
              onDelChart={handleDelChart}
              onDelChartGroup={handleDelChartGroup}
              range={range}
              refreshFlag={refreshFlag}
              variableConfig={variableConfigWithOptions!}
              moveUpEnable={i > 0}
              moveDownEnable={i < chartGroup.length - 1}
            />
          ))}
          <Button
            block
            icon={<PlusOutlined />}
            style={{
              paddingRight: 0,
            }}
            onClick={() => {
              groupForm.setFieldsValue({ name: '' });
              setGroupModalVisible(true);
            }}
          >
            {t('新增图表分组')}
          </Button>
        </div>
      </div>
      <Modal
        title={isAddGroup ? t('新建分组') : t('更新分组名称')}
        visible={groupModalVisible}
        onOk={handleAddOrUpdateChartGroup}
        onCancel={() => {
          setGroupModalVisible(false);
        }}
      >
        <Form {...layout} form={groupForm}>
          <Form.Item
            label={t('分组名称')}
            name='name'
            rules={[
              {
                required: true,
                message: t('请输入名称'),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {chartModalVisible && (
        <ChartConfigModal
          id={id}
          cluster={curCluster}
          busiId={busiId}
          initialValue={chartModalInitValue}
          groupId={groupId}
          show={chartModalVisible}
          onVisibleChange={handleChartConfigVisibleChange}
          variableConfig={variableConfigWithOptions}
        />
      )}
    </PageLayout>
  );
}
