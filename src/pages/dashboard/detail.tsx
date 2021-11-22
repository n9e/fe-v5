import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { ReloadOutlined, RollbackOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Form, Modal, Divider, message } from 'antd';
import { Range } from '@/components/DateRangePicker';
import { getSingleDashboard, updateSingleDashboard, createChartGroup, getChartGroup, delChartGroup, removeChart, updateChartGroup } from '@/services/dashboard';
import { Dashboard, Group } from '@/store/dashboardInterface';
import ChartGroup, { Chart } from './chartGroup';
import ChartConfigModal from './chartConfigModal';
import RefreshIcon from '@/components/RefreshIcon';
import VariableConfig from './VariableConfig';
import { TagFilterResponse } from './VariableConfig/definition';
import './index.less';
import { useTranslation } from 'react-i18next';
import Resolution from '@/components/Resolution';
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
  const variableRef = useRef<any>(null);
  const [dashboard, setDashboard] = useState<Dashboard>({
    create_by: '',
    favorite: 0,
    id: 0,
    name: '',
    tags: '',
    update_at: 0,
    update_by: '',
  });
  const [step, setStep] = useState(15);
  const [titleEditing, setTitleEditing] = useState(false);
  const [chartGroup, setChartGroup] = useState<Group[]>([]);
  const [variableConfig, setVariableConfig] = useState<TagFilterResponse | null>(null);
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

      // if (res.dat.configs) {
      //   setVariableConfig(JSON.parse(res.dat.configs));
      //   variableRef.current && variableRef.current.setInitData(res.dat.configs);
      // }
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
    await init();
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

  const handleDelChart = (group: Group, item: Chart) => {
    groupId = group.id;
    removeChart(busiId, item.id);
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
    await delChartGroup(id);
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

  const handleVariableChange = (value) => {
    // updateSingleDashboard(id, { ...dashboard, configs: JSON.stringify(value) });
    setVariableConfig(value);
  };

  return (
    <PageLayout
      customArea={
        <div className='dashboard-detail-header'>
          <div className='dashboard-detail-header-left'>
            <RollbackOutlined className='back' onClick={() => history.push('/dashboard')} />
            {titleEditing ? <Input defaultValue={dashboard.name} onPressEnter={handleModifyTitle} /> : <div className='title'>{dashboard.name}</div>}
            <EditOutlined className='edit' onClick={handleEdit} />
          </div>
          <div className='dashboard-detail-header-right'>
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
          <VariableConfig ref={variableRef} onChange={handleVariableChange} />
        </div>

        <div className='charts'>
          {chartGroup.map((item, i) => (
            <ChartGroup
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
              variableConfig={variableConfig}
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
            onClick={() => setGroupModalVisible(true)}
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
        <ChartConfigModal busiId={busiId} initialValue={chartModalInitValue} groupId={groupId} show={chartModalVisible} onVisibleChange={handleChartConfigVisibleChange} />
      )}
    </PageLayout>
  );
}
