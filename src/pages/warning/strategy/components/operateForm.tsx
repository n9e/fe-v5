import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import moment from 'moment';
import { Card, Form, Input, InputNumber, Radio, Select, Row, Col, Button, TimePicker, Checkbox, Modal, message, Space, Switch, Tooltip, Tag, notification } from 'antd';
const { TextArea } = Input;
const { Option } = Select;
import { QuestionCircleFilled, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getTeamInfoList, getNotifiesList } from '@/services/manage';
import { addOrEditStrategy, EditStrategy, prometheusQuery, deleteStrategy } from '@/services/warning';
import PromqlEditor from '@/components/PromqlEditor';
import { SwitchWithLabel } from './SwitchWithLabel';
import { debounce } from 'lodash';
const layout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 21,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 3,
  },
};

interface Props {
  detail?: any;
  type?: number; // 1:编辑 2:克隆
}

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

const operateForm: React.FC<Props> = ({ type, detail = {} }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory(); // 创建的时候默认选中的值

  const [form] = Form.useForm();
  const { clusters: clusterList } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);

  const [contactList, setInitContactList] = useState([]);
  const [notifyGroups, setNotifyGroups] = useState<any[]>([]);
  const [initVal, setInitVal] = useState<any>({});
  const [refresh, setRefresh] = useState(true);
  useEffect(() => {
    getNotifyChannel();
    getGroups('');

    return () => {};
  }, []);

  useEffect(() => {
    const data = {
      ...detail,
      enable_time: detail?.enable_stime ? [detail.enable_stime, detail.enable_etime] : [],
      enable_status: detail?.disabled === undefined ? true : !detail?.disabled,
    };
    setInitVal(data);
    if (type == 1) {
      const groups = (detail.notify_groups_obj ? detail.notify_groups_obj.filter((item) => !notifyGroups.find((i) => item.id === i.id)) : []).concat(notifyGroups);
      setNotifyGroups(groups);
    }
  }, [JSON.stringify(detail)]);

  const enableDaysOfWeekOptions = [t('周日'), t('周一'), t('周二'), t('周三'), t('周四'), t('周五'), t('周六')].map((v, i) => {
    return <Option value={String(i)} key={i}>{`${v}`}</Option>;
  });

  const contactListCheckboxes = contactList.map((c: string) => (
    <Checkbox value={c} key={c}>
      {c}
    </Checkbox>
  ));

  const notifyGroupsOptions = notifyGroups.map((ng: any) => (
    <Option value={String(ng.id)} key={ng.id}>
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
    const combineData = (detail.notify_groups_obj ? detail.notify_groups_obj.filter((item) => !data.find((i) => item.id === i.id)) : []).concat(data);
    setNotifyGroups(combineData || []);
  };

  const addSubmit = () => {
    form.validateFields().then(async (values) => {
      const res = await prometheusQuery({ query: values.prom_ql });
      if (res.error) {
        notification.error({
          message: res.error,
        });
        return false;
      }
      const callbacks = values.callbacks.map((item) => item.url);
      const data = {
        ...values,
        enable_stime: values.enable_time[0].format('HH:mm'),
        enable_etime: values.enable_time[1].format('HH:mm'),
        disabled: !values.enable_status ? 1 : 0,
        notify_recovered: values.notify_recovered ? 1 : 0,
        enable_in_bg: values.enable_in_bg ? 1 : 0,
        callbacks,
      };
      let reqBody,
        method = 'Post';
      if (type === 1) {
        reqBody = data;
        method = 'Put';
        const res = await EditStrategy(reqBody, curBusiItem.id, detail.id);
        if (res.err) {
          message.error(res.error);
        } else {
          message.success(t('编辑成功！'));
          history.push('/alert-rules');
        }
      } else {
        reqBody = [data];
        const { dat } = await addOrEditStrategy(reqBody, curBusiItem.id, method);
        let errorNum = 0;
        const msg = Object.keys(dat).map((key) => {
          dat[key] && errorNum++;
          return dat[key];
        });

        if (!errorNum) {
          message.success(`${type === 2 ? t('告警规则克隆成功') : t('告警规则创建成功')}`);
          history.push('/alert-rules');
        } else {
          message.error(t(msg));
        }
      }
    });
  };

  const debounceFetcher = useCallback(debounce(getGroups, 800), []);
  return (
    <div className='operate_con'>
      <Form
        {...layout}
        form={form}
        className='strategy-form'
        layout={refresh ? 'horizontal' : 'horizontal'}
        initialValues={{
          prom_eval_interval: 15,
          prom_for_duration: 60,
          severity: 2,
          disabled: 0, // 0:立即启用 1:禁用  待修改
          // notify_recovered: 1, // 1:启用
          cluster: clusterList[0] || 'Default', // 生效集群
          enable_days_of_week: ['1', '2', '3', '4', '5', '6', '0'],
          ...detail,
          enable_in_bg: detail?.enable_in_bg === 1,
          enable_time: detail?.enable_stime ? [moment(detail.enable_stime, 'HH:mm'), moment(detail.enable_etime, 'HH:mm')] : [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')],
          enable_status: detail?.disabled === undefined ? true : !detail?.disabled,
          notify_recovered: detail?.notify_recovered === 1 || detail?.notify_recovered === undefined ? true : false, // 1:启用 0:禁用
          recover_duration: detail?.recover_duration || 0,
          callbacks: !!detail?.callbacks
            ? detail.callbacks.map((item) => ({
                url: item,
              }))
            : [{}],
        }}
      >
        <Space direction='vertical' style={{ width: '100%' }}>
          <Card title={t('基本配置')}>
            <Form.Item
              label={t('规则标题：')}
              name='name'
              rules={[
                {
                  required: true,
                  message: t('规则标题不能为空'),
                },
              ]}
            >
              <Input placeholder={t('请输入规则标题')} />
            </Form.Item>
            <Form.Item
              label={t('规则备注：')}
              name='note'
              rules={[
                {
                  required: false,
                },
              ]}
            >
              <Input placeholder={t('请输入规则备注')} />
            </Form.Item>
            <Form.Item
              label={t('告警级别')}
              name='severity'
              rules={[
                {
                  required: true,
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
            <Form.Item
              label={t('生效集群')}
              name='cluster'
              rules={[
                {
                  required: true,
                  message: t('生效集群不能为空'),
                },
              ]}
            >
              <Select>
                {clusterList?.map((item) => (
                  <Option value={item} key={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label='PromQL' className={'Promeql-content'} required>
              <Form.Item
                name='prom_ql'
                // labelCol={{ span: 3 }}
                // wrapperCol={{ span: 23 }}
                validateTrigger={['onBlur']}
                trigger='onChange'
                rules={[{ required: true, message: t('请输入PromQL') }]}
              >
                <PromqlEditor
                  // className='promql-editor'
                  xCluster='Default'
                  onChange={(val) => {
                    if (val) {
                      form.validateFields(['prom_ql']);
                    }
                  }}
                />
              </Form.Item>
            </Form.Item>
            <Form.Item required label={t('执行频率')}>
              <Space>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  name='prom_eval_interval'
                  initialValue={15}
                  wrapperCol={{ span: 10 }}
                  rules={[
                    {
                      required: true,
                      message: t('执行频率不能为空'),
                    },
                  ]}
                >
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
            <Form.Item
              required
              label={t('持续时长')}
              rules={[
                {
                  required: true,
                  message: t('持续时长不能为空'),
                },
              ]}
            >
              <Space>
                <Form.Item style={{ marginBottom: 0 }} name='prom_for_duration' wrapperCol={{ span: 10 }}>
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
            <Form.Item label='附加标签' name='append_tags' rules={[{ required: false, message: '请填写至少一项标签！' }, isValidFormat]}>
              <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={'标签格式为 key=value ，使用回车或空格分隔'} tagRender={tagRender} />
            </Form.Item>
            <Form.Item label={t('预案链接')} name='runbook_url'>
              <Input />
            </Form.Item>
          </Card>
          <Card title={t('生效配置')}>
            <Form.Item
              label={t('立即启用')}
              name='enable_status'
              rules={[
                {
                  required: true,
                  message: t('立即启用不能为空'),
                },
              ]}
              valuePropName='checked'
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label={t('生效时间')}
              name='enable_days_of_week'
              rules={[
                {
                  required: true,
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
                  required: true,
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
            <Form.Item label={t('仅在本业务组生效')} name='enable_in_bg' valuePropName='checked'>
              <SwitchWithLabel label='根据告警事件中的ident归属关系判断' />
            </Form.Item>
          </Card>
          <Card title={t('通知配置')}>
            <Form.Item label={t('通知媒介')} name='notify_channels'>
              <Checkbox.Group>{contactListCheckboxes}</Checkbox.Group>
            </Form.Item>
            <Form.Item label={t('告警接收组')} name='notify_groups'>
              <Select mode='multiple' showSearch optionFilterProp='children' filterOption={false} onSearch={(e) => debounceFetcher(e)} onBlur={() => getGroups('')}>
                {notifyGroupsOptions}
              </Select>
            </Form.Item>
            <Form.Item label={t('启用恢复通知')}>
              <Space>
                <Form.Item name='notify_recovered' valuePropName='checked' style={{ marginBottom: 0 }}>
                  <Switch />
                </Form.Item>
                <Tooltip title={t(`告警恢复时也发送通知`)}>
                  <QuestionCircleFilled />
                </Tooltip>
              </Space>
            </Form.Item>
            <Form.Item label={t('留观时长')} required>
              <Space>
                <Form.Item style={{ marginBottom: 0 }} name='recover_duration' initialValue={0} wrapperCol={{ span: 10 }}>
                  <InputNumber
                    min={0}
                    onChange={(val) => {
                      setRefresh(!refresh);
                    }}
                  />
                </Form.Item>
                秒
                <Tooltip title={t(`持续${form.getFieldValue('recover_duration')}秒没有再次触发阈值才发送恢复通知`)}>
                  <QuestionCircleFilled />
                </Tooltip>
              </Space>
            </Form.Item>
            <Form.Item label={t('重复发送频率')} required>
              <Space>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  name='notify_repeat_step'
                  initialValue={60}
                  wrapperCol={{ span: 10 }}
                  rules={[
                    {
                      required: true,
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
            <Form.Item label={t('回调地址')}>
              <Form.List name='callbacks' initialValue={[{}]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Row gutter={[10, 0]} key={field.key}>
                        <Col span={22}>
                          <Form.Item name={[field.name, 'url']} fieldKey={[field.fieldKey, 'url']}>
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
          </Card>
          <Form.Item
            // {...tailLayout}
            style={{
              marginTop: 20,
            }}
          >
            <Button type='primary' onClick={addSubmit} style={{ marginRight: '8px' }}>
              {type === 1 ? t('编辑') : type === 2 ? t('克隆') : t('创建')}
            </Button>
            {type === 1 && (
              <Button
                danger
                style={{ marginRight: '8px' }}
                onClick={() => {
                  Modal.confirm({
                    title: t('是否删除该告警规则?'),
                    onOk: () => {
                      deleteStrategy([detail.id], curBusiItem.id).then(() => {
                        message.success(t('删除成功'));
                        history.push('/alert-rules');
                      });
                    },

                    onCancel() {},
                  });
                }}
              >
                {t('删除')}
              </Button>
            )}

            <Button
              onClick={() => {
                history.push('/alert-rules');
              }}
            >
              {t('取消')}
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </div>
  );
};

export default operateForm;
