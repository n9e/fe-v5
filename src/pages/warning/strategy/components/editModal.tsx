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
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Form, Input, InputNumber, Radio, Select, Row, Col, TimePicker, Checkbox, Tag, message, Space, Switch, Tooltip, Modal } from 'antd';
const { Option } = Select;
import { QuestionCircleFilled, MinusCircleOutlined, PlusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getTeamInfoList, getNotifiesList } from '@/services/manage';
import { SwitchWithLabel } from './SwitchWithLabel';
import { debounce } from 'lodash';
const layout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 20,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 5,
  },
};

const fields = [
  {
    id: 2,
    field: 'cluster',
    name: '集群',
  },
  {
    id: 3,
    field: 'severity',
    name: '级别',
  },
  {
    id: 5,
    field: 'prom_eval_interval',
    name: '执行频率',
  },
  {
    id: 6,
    field: 'prom_for_duration',
    name: '持续时长',
  },
  {
    id: 4,
    field: 'disabled',
    name: '启用',
  },
  {
    id: 13,
    field: 'enable_time',
    name: '生效时间',
  },
  {
    id: 14,
    field: 'enable_in_bg',
    name: '仅在本业务组生效',
  },
  {
    id: 12,
    field: 'append_tags',
    name: '附加标签',
  },
  {
    id: 7,
    field: 'notify_channels',
    name: '通知媒介',
  },
  {
    id: 8,
    field: 'notify_groups',
    name: '告警接收组',
  },
  {
    id: 9,
    field: 'notify_recovered',
    name: '启用恢复通知',
  },
  {
    id: 10,
    field: 'notify_repeat_step',
    name: '重复发送频率',
  },
  {
    id: 15,
    field: 'recover_duration',
    name: '留观时长',
  },
  {
    id: 16,
    field: 'notify_max_number',
    name: '最大发送次数',
  },
  {
    id: 11,
    field: 'callbacks',
    name: '回调地址',
  },
  {
    id: 0,
    field: 'note',
    name: '备注',
  },
  {
    id: 1,
    field: 'runbook_url',
    name: '预案链接',
  },
];

// 校验单个标签格式是否正确
function isTagValid(tag) {
  const contentRegExp = /^[a-zA-Z_][\w]*={1}[^=]+$/;
  return {
    isCorrectFormat: contentRegExp.test(tag.toString()),
    isLengthAllowed: tag.toString().length <= 64,
  };
}

// 渲染标签
function tagRender(content) {
  const { isCorrectFormat, isLengthAllowed } = isTagValid(content.value);
  return isCorrectFormat && isLengthAllowed ? (
    <Tag
      closable={content.closable}
      onClose={content.onClose}
      // style={{ marginTop: '2px' }}
    >
      {content.value}
    </Tag>
  ) : (
    <Tooltip title={isCorrectFormat ? '标签长度应小于等于 64 位' : '标签格式应为 key=value。且 key 以字母或下划线开头，由字母、数字和下划线组成。'}>
      <Tag color='error' closable={content.closable} onClose={content.onClose} style={{ marginTop: '2px' }}>
        {content.value}
      </Tag>
    </Tooltip>
  );
}

// 校验所有标签格式
function isValidFormat() {
  return {
    validator(_, value) {
      const isInvalid =
        value &&
        value.some((tag) => {
          const { isCorrectFormat, isLengthAllowed } = isTagValid(tag);
          if (!isCorrectFormat || !isLengthAllowed) {
            return true;
          }
        });
      return isInvalid ? Promise.reject(new Error('标签格式不正确，请检查！')) : Promise.resolve();
    },
  };
}

interface Props {
  isModalVisible: boolean;
  editModalFinish: Function;
}

const editModal: React.FC<Props> = ({ isModalVisible, editModalFinish }) => {
  const { t, i18n } = useTranslation();

  const [form] = Form.useForm();
  const { clusters: clusterList } = useSelector<RootState, CommonStoreState>((state) => state.common);

  const [contactList, setInitContactList] = useState([]);
  const [notifyGroups, setNotifyGroups] = useState([]);

  const [field, setField] = useState<string>('cluster');
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    getNotifyChannel();
    getGroups('');

    return () => {};
  }, []);

  const enableDaysOfWeekOptions = [t('周日'), t('周一'), t('周二'), t('周三'), t('周四'), t('周五'), t('周六')].map((v, i) => {
    return <Option value={String(i)} key={i}>{`${v}`}</Option>;
  });

  const contactListCheckboxes = contactList.map((c: { key: string; label: string }) => (
    <Checkbox value={c.key} key={c.label}>
      {c.label}
    </Checkbox>
  ));

  const notifyGroupsOptions = notifyGroups.map((ng: any) => (
    <Option value={ng.id} key={ng.id}>
      {ng.name}
    </Option>
  ));

  const getNotifyChannel = async () => {
    const res = await getNotifiesList();
    let contactList = res || [];
    setInitContactList(contactList);
  };

  const getGroups = async (str) => {
    const res = await getTeamInfoList({ query: str });
    const data = res.dat || res;
    setNotifyGroups(data || []);
  };

  const debounceFetcher = useCallback(debounce(getGroups, 800), []);

  const modelOk = () => {
    form.validateFields().then(async (values) => {
      const data = { ...values };
      switch (values.field) {
        case 'enable_time':
          data.enable_stime = values.enable_time[0].format('HH:mm');
          data.enable_etime = values.enable_time[1].format('HH:mm');
          delete data.enable_time;
          break;
        case 'disabled':
          data.disabled = !values.enable_status ? 1 : 0;
          delete data.enable_status;
          break;
        case 'enable_in_bg':
          data.enable_in_bg = values.enable_in_bg ? 1 : 0;
          break;
        case 'callbacks':
          data.callbacks = values.callbacks.map((item) => item.url);
          break;
        case 'notify_recovered':
          data.notify_recovered = values.notify_recovered ? 1 : 0;
          break;
        default:
          break;
      }
      delete data.field;
      Object.keys(data).forEach((key) => {
        // 因为功能上有清除备注的需求，需要支持传空
        if (data[key] === undefined) {
          data[key] = '';
        }
        if (Array.isArray(data[key])) {
          data[key] = data[key].join(' ');
        }
      });
      editModalFinish(true, data);
    });
  };

  const editModalClose = () => {
    editModalFinish(false);
  };

  const fieldChange = (val) => {
    setField(val);
  };

  return (
    <>
      <Modal
        title={t('批量更新')}
        visible={isModalVisible}
        onOk={modelOk}
        onCancel={() => {
          editModalClose();
        }}
      >
        <Form
          {...layout}
          form={form}
          className='strategy-form'
          layout={refresh ? 'horizontal' : 'horizontal'}
          initialValues={{
            prom_eval_interval: 15,
            disabled: 0, // 0:立即启用 1:禁用
            enable_status: true, // true:立即启用 false:禁用
            notify_recovered: 1, // 1:启用
            enable_time: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')],
            cluster: clusterList[0] || 'Default', // 生效集群
            enable_days_of_week: ['1', '2', '3', '4', '5', '6', '0'],
            field: 'cluster',
          }}
        >
          <Form.Item
            label={t('字段：')}
            name='field'
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select suffixIcon={<CaretDownOutlined />} style={{ width: '100%' }} onChange={fieldChange}>
              {fields.map((item) => (
                <Option key={item.id} value={item.field}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {(() => {
            switch (field) {
              case 'note':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      name='note'
                      rules={[
                        {
                          required: false,
                        },
                      ]}
                    >
                      <Input placeholder={t('请输入规则备注')} />
                    </Form.Item>
                  </>
                );
              case 'runbook_url':
                return (
                  <>
                    <Form.Item label={t('改为：')} name='runbook_url'>
                      <Input />
                    </Form.Item>
                  </>
                );

              case 'cluster':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      name='cluster'
                      rules={[
                        {
                          required: false,
                          message: t('生效集群不能为空'),
                        },
                      ]}
                    >
                      <Select suffixIcon={<CaretDownOutlined />}>
                        {clusterList?.map((item) => (
                          <Option value={item} key={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </>
                );
              case 'severity':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      name='severity'
                      initialValue={2}
                      rules={[
                        {
                          required: false,
                          message: t('告警级别不能为空'),
                        },
                      ]}
                    >
                      <Radio.Group>
                        <Radio value={1}>{t('一级报警')}</Radio>
                        <Radio value={2}>{t('二级报警')}</Radio>
                        <Radio value={3}>{t('三级报警')}</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </>
                );
              case 'disabled':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      name='enable_status'
                      rules={[
                        {
                          required: false,
                          message: t('立即启用不能为空'),
                        },
                      ]}
                      valuePropName='checked'
                    >
                      <Switch />
                    </Form.Item>
                  </>
                );
              case 'enable_in_bg':
                return (
                  <>
                    <Form.Item label={t('改为：')} name='enable_in_bg' valuePropName='checked'>
                      <SwitchWithLabel label='根据告警事件中的ident归属关系判断' />
                    </Form.Item>
                  </>
                );
              case 'prom_eval_interval':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      rules={[
                        {
                          required: false,
                          message: t('执行频率不能为空'),
                        },
                      ]}
                    >
                      <Space>
                        <Form.Item style={{ marginBottom: 0 }} name='prom_eval_interval' initialValue={15} wrapperCol={{ span: 10 }}>
                          <InputNumber
                            min={1}
                            onChange={(val) => {
                              setRefresh(!refresh);
                            }}
                          />
                        </Form.Item>
                        秒
                        <Tooltip title={t(`每隔${form.getFieldValue('prom_eval_interval')}秒，把PromQL作为查询条件，去查询后端存储，如果查到了数据就表示当次有监控数据触发了规则`)}>
                          <QuestionCircleFilled />
                        </Tooltip>
                      </Space>
                    </Form.Item>
                  </>
                );
              case 'prom_for_duration':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      rules={[
                        {
                          required: false,
                          message: t('持续时长不能为空'),
                        },
                      ]}
                    >
                      <Space>
                        <Form.Item style={{ marginBottom: 0 }} name='prom_for_duration' initialValue={60} wrapperCol={{ span: 10 }}>
                          <InputNumber min={0} />
                        </Form.Item>
                        秒
                        <Tooltip
                          title={t(
                            `通常持续时长大于执行频率，在持续时长内按照执行频率多次执行PromQL查询，每次都触发才生成告警；如果持续时长置为0，表示只要有一次PromQL查询触发阈值，就生成告警`,
                          )}
                        >
                          <QuestionCircleFilled />
                        </Tooltip>
                      </Space>
                    </Form.Item>
                  </>
                );
              case 'notify_channels':
                return (
                  <>
                    <Form.Item label={t('改为：')} name='notify_channels'>
                      <Checkbox.Group>{contactListCheckboxes}</Checkbox.Group>
                    </Form.Item>
                  </>
                );
              case 'notify_groups':
                return (
                  <>
                    <Form.Item label={t('改为：')} name='notify_groups'>
                      <Select mode='multiple' showSearch optionFilterProp='children' filterOption={false} onSearch={(e) => debounceFetcher(e)} onBlur={() => getGroups('')}>
                        {notifyGroupsOptions}
                      </Select>
                    </Form.Item>
                  </>
                );
              case 'notify_recovered':
                return (
                  <>
                    <Form.Item label={t('改为：')} name='notify_recovered' valuePropName='checked'>
                      <Switch />
                    </Form.Item>
                  </>
                );
              case 'recover_duration':
                return (
                  <>
                    <Form.Item label={t('改为：')}>
                      <Space>
                        <Form.Item
                          style={{ marginBottom: 0 }}
                          name='recover_duration'
                          initialValue={0}
                          wrapperCol={{ span: 10 }}
                          rules={[
                            {
                              required: false,
                              message: t('留观时长不能为空'),
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            onChange={(val) => {
                              setRefresh(!refresh);
                            }}
                          />
                        </Form.Item>
                        秒
                        <Tooltip title={t(`持续${form.getFieldValue('recover_duration') || 0}秒没有再次触发阈值才发送恢复通知`)}>
                          <QuestionCircleFilled />
                        </Tooltip>
                      </Space>
                    </Form.Item>
                  </>
                );
              case 'notify_repeat_step':
                return (
                  <>
                    <Form.Item label={t('改为：')}>
                      <Space>
                        <Form.Item
                          style={{ marginBottom: 0 }}
                          name='notify_repeat_step'
                          initialValue={60}
                          wrapperCol={{ span: 10 }}
                          rules={[
                            {
                              required: false,
                              message: t('重复发送频率不能为空'),
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            onChange={(val) => {
                              setRefresh(!refresh);
                            }}
                          />
                        </Form.Item>
                        分钟
                        <Tooltip title={t(`如果告警持续未恢复，间隔${form.getFieldValue('notify_repeat_step')}分钟之后重复提醒告警接收组的成员`)}>
                          <QuestionCircleFilled />
                        </Tooltip>
                      </Space>
                    </Form.Item>
                  </>
                );
              case 'notify_max_number':
                return (
                  <>
                    <Form.Item label={t('改为：')}>
                      <Space>
                        <Form.Item
                          style={{ marginBottom: 0 }}
                          name='notify_max_number'
                          initialValue={0}
                          wrapperCol={{ span: 10 }}
                          rules={[
                            {
                              required: true,
                              message: t('最大发送次数不能为空'),
                            },
                          ]}
                        >
                          <InputNumber min={0} precision={0} />
                        </Form.Item>
                        <Tooltip title={t(`如果值为0，则不做最大发送次数的限制`)}>
                          <QuestionCircleFilled />
                        </Tooltip>
                      </Space>
                    </Form.Item>
                  </>
                );
              case 'callbacks':
                return (
                  <>
                    <Form.Item label={t('改为：')}>
                      <Form.List name='callbacks' initialValue={[{}]}>
                        {(fields, { add, remove }, { errors }) => (
                          <>
                            {fields.map((field, index) => (
                              <Row gutter={[10, 0]} key={field.key}>
                                <Col span={22}>
                                  <Form.Item name={[field.name, 'url']}>
                                    <Input />
                                  </Form.Item>
                                </Col>

                                <Col span={1}>
                                  <MinusCircleOutlined className='control-icon-normal' onClick={() => remove(field.name)} />
                                </Col>
                              </Row>
                            ))}
                            <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
                          </>
                        )}
                      </Form.List>
                    </Form.Item>
                  </>
                );
              case 'append_tags':
                return (
                  <>
                    <Form.Item label='附加标签' name='append_tags' rules={[{ required: false, message: '请填写至少一项标签！' }, isValidFormat]}>
                      <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={'标签格式为 key=value ，使用回车或空格分隔'} tagRender={tagRender} />
                    </Form.Item>
                  </>
                );
              case 'enable_time':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      name='enable_days_of_week'
                      rules={[
                        {
                          required: false,
                          message: t('生效时间不能为空'),
                        },
                      ]}
                    >
                      <Select mode='tags'>{enableDaysOfWeekOptions}</Select>
                    </Form.Item>
                    <Form.Item
                      name='enable_time'
                      {...tailLayout}
                      rules={[
                        {
                          required: false,
                          message: t('生效时间不能为空'),
                        },
                      ]}
                    >
                      <TimePicker.RangePicker
                        format='HH:mm'
                        onChange={(val, val2) => {
                          form.setFieldsValue({
                            enable_stime: val2[0],
                            enable_etime: val2[1],
                          });
                        }}
                      />
                    </Form.Item>
                  </>
                );
              default:
                return null;
            }
          })()}
        </Form>
      </Modal>
    </>
  );
};

export default editModal;
