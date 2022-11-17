import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { useSelector, useDispatch } from 'react-redux';
import { ReloadOutlined, RollbackOutlined, EditOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Input, Form, Modal, Dropdown, message, Menu } from 'antd';
import { Range } from '@/components/DateRangePicker';
import { getSingleDashboard, updateSingleDashboard, createChartGroup, getChartGroup, delChartGroup, removeChart, updateChartGroup } from '@/services/dashboard';
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
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [chartModalVisible, setChartModalVisible] = useState(false);
  const [chartModalInitValue, setChartModalInitValue] = useState<Chart | null>();
  const [range, setRange] = useState<Range>({
    start: 0,
    end: 0,
  });
  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getSingleDashboard(busiId, id).then((res) => {
      setDashboard(res.dat);
      if (res.dat.configs) {
        const configs = JSON.parse(res.dat.configs);
        setVariableConfig(configs);
      }
    });
    getChartGroup(busiId, id).then((res) => {
      let arr = res.dat || [];
      setChartGroup(
        arr.map((item) => {
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

  const handleAddChart = (id: number) => {
    groupId = id;
    setChartModalVisible(true);
  }; //group是为了让detail组件知道当前需要刷新的是哪个chartGroup，item是为了获取待编辑的信息

  const handleUpdateChart = (group: Group, item: Chart) => {
    groupId = group.id;
    setChartModalInitValue(item);
    setChartModalVisible(true);
  };

  const handleDelChart = async (group: Group, item: Chart) => {
    groupId = group.id;
    await removeChart(busiId, item.id);
    refreshUpdateTimeByChartGroupId();
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
    // 删除中间分组需要保证weight连续，对大于所删除的分组做weight-1更新
    const tempGroup: Group[] = [];
    chartGroup.map(i => {
      if (i.weight > (chartGroup.filter(item => item.id === id))[0]?.weight) {
        tempGroup.push({ ...i, weight: i.weight - 1 });
      }
    })
    tempGroup?.length !== 0 && await updateChartGroup(busiId, tempGroup);
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

  const handleVariableChange = (value) => {
    updateSingleDashboard(busiId, id, { ...dashboard, configs: JSON.stringify(value) });
    setVariableConfig(value);
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
            <div style={{ marginRight: 20, display: 'flex', alignItems: 'center' }}>
              集群：
              <Dropdown overlay={clusterMenu}>
                <Button>
                  {curCluster} <DownOutlined />
                </Button>
              </Dropdown>
            </div>
            <DateRangePicker onChange={handleDateChange} />
            <Resolution onChange={(v) => setStep(v)} initialValue={step} />
            <RefreshIcon
              onClick={() => {
                init();
              }}
            />
          </div>
        </div>
      }
    >
      <div className='dashboard-detail-content'>
        <div className='variable-area'>
          <VariableConfig onChange={handleVariableChange} value={variableConfig} cluster={curCluster} />
        </div>

        <div className='charts'>
          {chartGroup.map((item, i) => (
            <ChartGroup
              cluster={curCluster}
              busiId={busiId}
              key={i}
              step={step}
              groupInfo={item}
              onAddChart={handleAddChart}
              onUpdateChart={handleUpdateChart}
              onUpdateChartGroup={handleUpdateChartGroup}
              onMoveUpChartGroup={handleMoveUpChartGroup}
              onMoveDownChartGroup={handleMoveDownChartGroup}
              onDelChart={handleDelChart}
              onDelChartGroup={handleDelChartGroup}
              range={range}
              variableConfig={variableConfig!}
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
          cluster={curCluster}
          busiId={busiId}
          initialValue={chartModalInitValue}
          groupId={groupId}
          show={chartModalVisible}
          onVisibleChange={handleChartConfigVisibleChange}
          variableConfig={variableConfig}
        />
      )}
    </PageLayout>
  );
}
