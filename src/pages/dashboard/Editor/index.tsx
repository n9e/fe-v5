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
import React, { useState, useEffect, useReducer } from 'react';
import { Modal, Form, Select, Space, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import DateRangePicker, { Range } from '@/components/DateRangePicker';
import Resolution from '@/components/Resolution';
import ModalHOC, { ModalWrapProps } from '../Components/ModalHOC';
import { visualizations, defaultValues, defaultCustomValuesMap } from './config';
import Renderer from '../Renderer/Renderer';
import { VariableType } from '../VariableConfig';
import FormCpt from './Form';
import { IPanel } from '../types';
import { Reducer } from '../Context';

interface IProps {
  initialValues: IPanel | null;
  variableConfig?: VariableType;
  cluster: string;
  id: string;
  onOK: (formData: any) => void;
}

function index(props: ModalWrapProps & IProps) {
  const { t } = useTranslation();
  const { visible, variableConfig, cluster, id } = props;
  const initialValues = _.cloneDeep(props.initialValues);
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
    return chartForm.validateFields().then(async (values) => {
      // TODO: 渲染 hexbin 图时，colorRange 需要从 string 转换为 array
      if (type === 'hexbin') {
        _.set(values, 'custom.colorRange', _.split(values.custom.colorRange, ','));
      }
      let formData = Object.assign(values, {
        version: '2.0.0',
        type,
        layout: initialValues?.layout,
      });
      if (initialValues && initialValues.id) {
        formData.id = initialValues.id;
      } else {
        formData.id = uuidv4();
      }
      props.onOK(formData);
      props.destroy();
    });
  };

  // TODO: 渲染 hexbin 配置时，colorRange 需要从 array 转换为 string
  if (initialValues.type === 'hexbin' && initialValues?.custom?.colorRange) {
    if (_.isArray(initialValues.custom.colorRange)) {
      _.set(initialValues, 'custom.colorRange', _.join(initialValues.custom.colorRange, ','));
    }
  }

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
            handleAddChart();
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
      <Reducer>
        <FormCpt
          chartForm={chartForm}
          setChangedFlag={setChangedFlag}
          initialValues={initialValues}
          type={type}
          variableConfig={variableConfig}
          cluster={cluster}
          range={range}
          id={id}
          render={(innerVariableConfig) => {
            return (
              <div style={{ height: 300 }}>
                <Renderer dashboardId={id} time={range} step={step} type={type} values={values} variableConfig={innerVariableConfig} isPreview />
              </div>
            );
          }}
        />
      </Reducer>
    </Modal>
  );
}

export default ModalHOC(index);
