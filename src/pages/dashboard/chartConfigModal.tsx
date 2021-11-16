import React, { useState, useEffect } from 'react';
import { GetMetrics } from '@/services/metric';
import { Metric } from '@/pages/metric/matric';
import { Dashboard, Group, ChartConfig } from '@/store/dashboardInterface';
import { resourceGroupItem, resourceItem, prefixType } from '@/store/businessInterface/resource';
import { debounce } from 'lodash';
import { Radio, InputNumber, Input, Form, Modal, Select, Checkbox, Row, Col, Space } from 'antd';
const { Option } = Select;
import { getResourceGroups, getResourceList, getResourceListAll } from '@/services/resource';
import { GetTagPairs } from '@/services/metric';
import { createChart, updateChart, checkPromql } from '@/services/dashboard';
import { formatTag, TagItem } from '@/components/TagFilterForChart';
import { Chart } from './chartGroup';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PromqlEditor from '@/components/PromqlEditor';
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
};
interface Props {
  busiId: string;
  groupId: number;
  show: boolean;
  onVisibleChange: (data: boolean) => void;
  initialValue?: Chart | null;
} // 新增图表和编辑图表均在此组件

export default function ChartConfigModal(props: Props) {
  const { t } = useTranslation();
  const { busiId, groupId, show, onVisibleChange, initialValue } = props;
  const layout = initialValue?.configs.layout;
  const [chartForm] = Form.useForm();
  const [initialQL, setInitialQL] = useState([{ PromQL: '' }]);
  useEffect(() => {
    console.log('initialValue', initialValue);
    if (initialValue) {
      chartForm.setFieldsValue(initialValue.configs);
      setInitialQL(initialValue.configs.QL);
    }
  }, [initialValue]);

  const handleAddChart = async (e) => {
    try {
      const values = await chartForm.validateFields();
      console.log('values', values);
      let formData: ChartConfig = Object.assign(chartForm.getFieldsValue(), {
        layout,
      });

      // if (initialValue && initialValue.id) {
      //   await updateChart(initialValue.id, {
      //     configs: JSON.stringify(formData),
      //     weight: 0,
      //     groupId,
      //   });
      // } else {
      await createChart(busiId, {
        configs: JSON.stringify(formData),
        weight: 0,
        group_id: groupId,
      });
      // }

      onVisibleChange(true);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const PromqlEditorField = ({ onChange = () => {}, value = '', fields, remove, add, index, name }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <PromqlEditor
          xCluster='Default'
          onChange={onChange}
          value={value}
          style={{
            width: '340px',
          }}
        />
        {fields.length > 1 ? (
          <MinusCircleOutlined
            style={{ marginLeft: 10 }}
            onClick={() => {
              remove(name);
            }}
          />
        ) : null}
        {index === fields.length - 1 && (
          <PlusCircleOutlined
            style={{ marginLeft: 10 }}
            onClick={() => {
              add();
            }}
          />
        )}
      </div>
    );
  };

  return (
    <Modal
      title={initialValue ? t('编辑图表') : t('新建图表')}
      visible={show}
      destroyOnClose={true}
      onOk={handleAddChart}
      onCancel={() => {
        onVisibleChange(false);
      }}
    >
      <Form {...layout} form={chartForm} preserve={false}>
        <Form.Item
          label={t('标题')}
          name='name'
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 20,
          }}
          rules={[
            {
              required: true,
              message: t('图表名称'),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={t('下钻链接')} name='link' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          <Input />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            span: 24,
          }}
          style={{
            marginBottom: '0px',
          }}
        >
          <Form.List name='QL' initialValue={initialQL}>
            {(fields, { add, remove }, { errors }) => {
              return (
                <>
                  {fields.length ? (
                    fields.map(({ key, name, fieldKey, ...restField }, index) => {
                      return (
                        <div key={name + fieldKey}>
                          <Form.Item
                            label='PromQL'
                            name={[name, 'PromQL']}
                            labelCol={{
                              span: 4,
                            }}
                            wrapperCol={{
                              span: 20,
                            }}
                            validateTrigger={['onBlur']}
                            rules={[
                              {
                                required: true,
                                message: t('请输入PromQL'),
                              },
                            ]}
                          >
                            <PromqlEditorField key={name + fieldKey} name={name} fields={fields} index={index} remove={remove} add={add} />
                          </Form.Item>
                          <Form.Item
                            label='Legend'
                            name={[name, 'Legend']}
                            labelCol={{
                              span: 4,
                            }}
                            wrapperCol={{
                              span: 20,
                            }}
                          >
                            <Input />
                          </Form.Item>
                        </div>
                      );
                    })
                  ) : (
                    <PlusCircleOutlined
                      onClick={() => {
                        add();
                      }}
                    />
                  )}
                  <Form.ErrorList errors={errors} />
                </>
              );
            }}
          </Form.List>
        </Form.Item>
        <Form.Item label={t('预警值')} name='yplotline-1' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          <InputNumber />
        </Form.Item>
        <Form.Item label={t('警告值')} name='yplotline-2' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
}
