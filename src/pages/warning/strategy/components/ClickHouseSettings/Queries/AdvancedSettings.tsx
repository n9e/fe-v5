import React, { useState } from 'react';
import { Row, Col, Form, Select, Tooltip, Input } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { useTranslation } from 'react-i18next';
interface IProps {
  prefixField?: any;
}
export default function AdvancedSettings(props: IProps) {
  const { t } = useTranslation();
  const { prefixField = {} } = props;
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(true);
  return (
    <div
      style={{
        marginBottom: advancedSettingsOpen ? 0 : 16,
      }}
    >
      <div
        style={{
          marginBottom: 8,
        }}
      >
        <span
          onClick={() => {
            setAdvancedSettingsOpen(!advancedSettingsOpen);
          }}
          style={{
            cursor: 'pointer',
          }}
        >
          {advancedSettingsOpen ? <DownOutlined /> : <RightOutlined />} {t('辅助配置')}
        </span>
      </div>
      <div
        style={{
          display: advancedSettingsOpen ? 'block' : 'none',
        }}
      >
        <Row gutter={8}>
          <Col span={6}>
            <InputGroupWithFormItem
              label={
                <span>
                  ValueKey{' '}
                  <Tooltip
                    title={t(
                      '通过此字段从返回结果中提取数值。例如 查询条件为 `select count() AS cnt, event_time from system.query_log ` 返回结果为 cnt:11，ValueKey 写了 cnt，则会根据 cnt 提取到 11，作为查询结果和报警判断的值',
                    )}
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={100}
            >
              <Form.Item
                {...prefixField}
                name={[prefixField.name, 'keys', 'valueKey']}
                style={{
                  width: '100%',
                }}
                rules={[
                  {
                    required: true,
                    message: t('请输入 valueKey'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={6}>
            <InputGroupWithFormItem
              label={
                <span>
                  LabelKey{' '}
                  <Tooltip
                    title={t(
                      '将此字段对应的 value，作为tag，追加到监控数据的标签中，例如 查询条件为 `select count() cnt, event_time, type from system.query_log GROUP BY type, event_time` 返回结果为 `[{cnt:11 type:QueryFinish},{cnt:10 type:QueryStart}]`, LabelKey 写了 type, 则返回的数据中type会作为时序数据的labels',
                    )}
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={100}
            >
              <Form.Item
                {...prefixField}
                name={[prefixField.name, 'keys', 'labelKey']}
                style={{
                  width: '100%',
                }}
              >
                <Select mode='tags' placeholder={t('回车输入多个')} />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}
