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
import { Modal, Form, Select, Space, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { IRawTimeRange } from '@/components/TimeRangePicker';
import Resolution from '@/components/Resolution';
import { visualizations, defaultValues, defaultCustomValuesMap } from './config';
import { IVariable } from '../VariableConfig';
import FormCpt from './Form';
import { IPanel } from '../types';

interface IProps {
  mode: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  initialValues: IPanel | null;
  variableConfigWithOptions?: IVariable[];
  cluster: string;
  id: string;
  time: IRawTimeRange;
  onOK: (formData: any, mode: string) => void;
}

function index(props: IProps) {
  const { t } = useTranslation();
  const formRef = useRef<any>();
  const { mode, visible, setVisible, variableConfigWithOptions, cluster, id, time } = props;
  const initialValues = _.cloneDeep(props.initialValues);
  const [range, setRange] = useState<IRawTimeRange>(time);
  const defaultType = _.get(initialValues, 'type') || defaultValues.type;
  const [type, setType] = useState<string>(defaultType);
  const [step, setStep] = useState<number | null>(null);
  const handleAddChart = async () => {
    if (formRef.current && formRef.current.getFormInstance) {
      const formInstance = formRef.current.getFormInstance();
      formInstance.validateFields().then(async (values) => {
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
        props.onOK(formData, mode);
        setVisible(false);
      });
    }
  };

  // TODO: 渲染 hexbin 配置时，colorRange 需要从 array 转换为 string
  if (initialValues.type === 'hexbin' && initialValues?.custom?.colorRange) {
    if (_.isArray(initialValues.custom.colorRange)) {
      _.set(initialValues, 'custom.colorRange', _.join(initialValues.custom.colorRange, ','));
    }
  }

  useEffect(() => {
    setType(_.get(initialValues, 'type') || defaultValues.type);
  }, [JSON.stringify(initialValues)]);

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
                if (formRef.current && formRef.current.getFormInstance) {
                  const formInstance = formRef.current.getFormInstance();
                  formInstance.setFieldsValue({
                    custom: defaultCustomValuesMap[val],
                  });
                }
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
            <TimeRangePicker
              dateFormat='YYYY-MM-DD HH:mm:ss'
              value={range}
              onChange={(val: IRawTimeRange) => {
                setRange(val);
              }}
            />
            <Resolution onChange={(v) => setStep(v)} initialValue={step} />
            <CloseOutlined
              style={{ fontSize: 18 }}
              onClick={() => {
                setVisible(false);
              }}
            />
          </Space>
        </div>
      }
      style={{ top: 10, padding: 0 }}
      visible={visible}
      closable={false}
      destroyOnClose
      footer={[
        <Button
          key='cancel'
          onClick={() => {
            setVisible(false);
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
        setVisible(false);
      }}
      bodyStyle={{
        padding: '10px 24px 24px 24px',
      }}
    >
      {!_.isEmpty(initialValues) && (
        <FormCpt
          ref={formRef}
          initialValues={initialValues}
          type={type}
          variableConfigWithOptions={variableConfigWithOptions}
          cluster={cluster}
          range={range}
          id={id}
          step={step}
        />
      )}
    </Modal>
  );
}

export default index;
