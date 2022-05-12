import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Input, Select, Space, Button, Modal, Form } from 'antd';
import { DatabaseOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/pageLayout';
import ColumnSelect from '@/components/ColumnSelect';
import DateRangePicker from '@/components/DateRangePicker';
import { Range } from '@/components/DateRangePicker';
import { RootState } from '@/store/common';
import { eventStoreState } from '@/store/eventInterface';
import { getMonObjectList } from '@/services/monObjectManage';
import Refresh from '../dashboard/Components/Refresh';
import MetricSelect from './MetricSelect';
import Hexbin from '../dashboard/Renderer/Renderer/Hexbin';
import StandardOptions from '../dashboard/Editor/Fields/StandardOptions';
import ValueMappings from '../dashboard/Editor/Fields/ValueMappings';
import './style.less';

export default function index() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [curBusiId, setCurBusiId] = useState<number>(-1);
  const [curClusterItems, setCurClusterItems] = useState<string[]>([]);
  const [range, setRange] = useState<Range>({
    num: 1,
    unit: 'hours',
    description: '',
  });
  const { queryContent } = useSelector<RootState, eventStoreState>((state) => state.event);
  const [query, setQuery] = useState<string>();
  const [targets, setTargets] = useState<string[]>([]);
  const [calc, setCalc] = useState<string>('avg');
  const [series, setSeries] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);
  const [options, setOptions] = useState<any>({});
  function saveData(prop, data) {
    dispatch({
      type: 'event/saveData',
      prop,
      data,
    });
  }

  useEffect(() => {
    getMonObjectList({
      bgid: curBusiId,
      clusters: _.join(curClusterItems, ','),
      query,
    }).then((res) => {
      setTargets(res.dat.list);
    });
  }, [curBusiId, curClusterItems, query]);

  return (
    <PageLayout icon={<DatabaseOutlined />} title={t('对象蜂窝图')} hideCluster>
      <div>
        <div className='targets-map-container'>
          <div className='targets-map-header'>
            <Space>
              <Refresh onRefresh={() => {}} />
              <DateRangePicker onChange={setRange} />
              <ColumnSelect noLeftPadding onBusiGroupChange={(e) => setCurBusiId(typeof e === 'number' ? e : -1)} onClusterChange={(e) => setCurClusterItems(e)} />
              <Input
                className='search-input'
                prefix={<SearchOutlined />}
                placeholder='模糊搜索规则和标签(多个关键词请用空格分隔)'
                value={queryContent}
                onChange={(e) => saveData('queryContent', e.target.value)}
                onPressEnter={() => {
                  setQuery(queryContent);
                }}
              />
            </Space>
            <Space>
              <MetricSelect
                range={range}
                idents={_.map(targets, 'ident')}
                calc={calc}
                onChange={(val) => {
                  setSeries(val);
                }}
              />
              <Select
                value={calc}
                onChange={(e) => {
                  setCalc(e);
                }}
              >
                <Select.Option value='avg'>avg</Select.Option>
                <Select.Option value='max'>max</Select.Option>
                <Select.Option value='min'>min</Select.Option>
                <Select.Option value='sum'>sum</Select.Option>
              </Select>
              <Button
                icon={<SettingOutlined />}
                onClick={() => {
                  setVisible(true);
                }}
              />
            </Space>
          </div>
          <div style={{ padding: 20 }}>
            <Hexbin
              series={series}
              values={
                {
                  custom: {
                    calc,
                  },
                  options: options.options,
                } as any
              }
            />
          </div>
        </div>
      </div>
      <Modal
        title='自定义设置'
        width={600}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          form.validateFields().then((values) => {
            setOptions(values);
            setVisible(false);
          });
        }}
      >
        <Form layout='vertical' form={form} initialValues={{}}>
          <div className='n9e-collapse'>
            <ValueMappings />
            <StandardOptions />
          </div>
        </Form>
      </Modal>
    </PageLayout>
  );
}
