import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Space, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import DateRangePicker, { Range } from '@/components/DateRangePicker';
import Resolution from '@/components/Resolution';
import ModalHOC, { ModalWrapProps } from './ModalHOC';
import { visualizations, defaultValues, defaultCustomValuesMap } from './config';
import Renderer from '../Renderer/Renderer';
import { createChart, updateCharts } from '@/services/dashboard';
import { VariableType } from '../VariableConfig';
import FormCpt from './Form';
import { IPanel } from '../types';

interface IProps {
  initialValues: IPanel | null;
  variableConfig?: VariableType;
  cluster: string;
  busiId: string;
  groupId: number;
  onOK: () => void;
}

function index(props: ModalWrapProps & IProps) {
  const { t } = useTranslation();
  const { visible, initialValues, variableConfig, cluster, busiId, groupId } = props;
  const [chartForm] = Form.useForm();
  const [range, setRange] = useState<Range>({
    description: '小时',
    num: 1,
    unit: 'hour',
  });
  const defaultType = _.get(initialValues, 'type') || defaultValues.type;
  const [type, setType] = useState<string>(defaultType);
  const [step, setStep] = useState<number | null>(null);
  const [changedFlag, setChangedFlag] = useState<string>(_.uniqueId('xxx_'));
  const [values, setValues] = useState<any>(chartForm.getFieldsValue());

  const handleAddChart = async () => {
    try {
      await chartForm.validateFields();
      let formData = Object.assign(chartForm.getFieldsValue(), {
        version: '2.0.0', // Temporarily, hardcode 1
        type,
        layout: initialValues?.layout,
      });
      if (initialValues && initialValues.id) {
        await updateCharts(busiId, [
          {
            configs: formData,
            weight: 0,
            group_id: groupId,
            id: initialValues.id,
          },
        ]);
      } else {
        await createChart(busiId, {
          configs: JSON.stringify(formData),
          weight: 0,
          group_id: groupId,
        });
      }
      // onVisibleChange(true);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  useEffect(() => {
    setValues(chartForm.getFieldsValue());
  }, [changedFlag]);

  return (
    <Modal
      width='100%'
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{initialValues ? t('编辑图表') : t('新建图表')}</div>
          <Space style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 12, lineHeight: '20px' }}>
            <Select
              dropdownMatchSelectWidth={false}
              value={type}
              onChange={(val) => {
                setType(val);
                chartForm.setFieldsValue({
                  custom: defaultCustomValuesMap[val],
                });
                // TODO: setFieldsValue 可能是个异步的，无法立刻拿到最新的 values，后面需要翻下 antd.form 组件源码
                setTimeout(() => {
                  setChangedFlag(_.uniqueId('xxx_'));
                }, 100);
              }}
            >
              {_.map(visualizations, (item) => {
                return (
                  <Select.Option value={item.type} key={item.type}>
                    {item.name}
                  </Select.Option>
                );
              })}
            </Select>
            <DateRangePicker onChange={(e) => setRange(e)} />
            <Resolution onChange={(v) => setStep(v)} initialValue={step} />
            <CloseOutlined
              style={{ fontSize: 18 }}
              onClick={() => {
                props.destroy();
              }}
            />
          </Space>
        </div>
      }
      style={{ top: 10, padding: 0 }}
      visible={visible}
      closable={false}
      footer={[
        <Button
          key='cancel'
          onClick={() => {
            props.destroy();
          }}
        >
          取消
        </Button>,
        <Button
          key='ok'
          type='primary'
          onClick={() => {
            handleAddChart().then(() => {
              props.onOK();
              props.destroy();
            });
          }}
        >
          确认
        </Button>,
      ]}
      onCancel={() => {
        props.destroy();
      }}
      bodyStyle={{
        padding: '10px 24px 24px 24px',
      }}
    >
      <FormCpt
        chartForm={chartForm}
        setChangedFlag={setChangedFlag}
        initialValues={initialValues}
        type={type}
        variableConfig={variableConfig}
        cluster={cluster}
        render={(innerVariableConfig) => {
          return (
            <div style={{ height: 300, border: '1px solid #d9d9d9' }}>
              <Renderer time={range} step={step} type={type} values={values} variableConfig={innerVariableConfig} />
            </div>
          );
        }}
      />
    </Modal>
  );
}

export default ModalHOC(index);
