import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import moment from 'moment';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Row,
  Col,
  Button,
  TimePicker,
  Checkbox,
  notification,
  message,
  Space,
  Switch,
  Tooltip,
} from 'antd';
const { TextArea } = Input;
const { Option } = Select;
import {
  QuestionCircleFilled,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store/common';
import { Metric } from '@/store/warningInterface';
import { CommonStoreState } from '@/store/commonInterface';
import { getTeamInfoList, getNotifiesList } from '@/services/manage';
import { addOrEditStrategy, EditStrategy } from '@/services/warning';
import PromqlEditor from '@/components/PromqlEditor';
import ChartDrawer from './Drawer';

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

const operateForm: React.FC<Props> = ({ type, detail }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory(); // 创建的时候默认选中的值

  const [form] = Form.useForm();
  const { clusters: clusterList } = useSelector<RootState, CommonStoreState>(
    (state) => state.common,
  );
  const { curBusiItem } = useSelector<RootState, CommonStoreState>(state => state.common);

  const [contactList, setInitContactList] = useState([]);
  const [notifyGroups, setNotifyGroups] = useState([]);
  const [initVal, setInitVal] = useState<any>({});
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    getNotifyChannel();
    getGroups();

    return () => { };
  }, []);

  useEffect(() => {
    const data = {
      ...detail,
      enable_time: detail?.enable_stime ? [detail.enable_stime, detail.enable_etime] : [],
      enable_status: detail?.disabled === undefined ? true : !detail?.disabled
    }
    setInitVal(data);

  }, [JSON.stringify(detail)])

  const enableDaysOfWeekOptions = [
    t('周日'),
    t('周一'),
    t('周二'),
    t('周三'),
    t('周四'),
    t('周五'),
    t('周六'),
  ].map((v, i) => {
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

  const getGroups = async () => {
    const res = await getTeamInfoList();
    const data = res.dat || res;
    setNotifyGroups(data || []);
  };

  const handleTagsChange = (value: string[]) => {
    let top: string = value[value.length - 1];
    let reg = /\w+=\w+/;

    if (top && !reg.test(top)) {
      let v = value.pop();
      message.error(`"${v}${t('"不符合输入规范（格式为key=value）')}`);
    }
  };

  const addSubmit = () => {
    form.validateFields().then(async (values) => {
      const callbacks = values.callbacks.map(item => item.url);
      const data = {
        ...values,
        enable_stime: values.enable_time[0].format('HH:mm'),
        enable_etime: values.enable_time[1].format('HH:mm'),
        disabled: !values.enable_status ? 1 : 0,
        notify_recovered: values.notify_recovered ? 1 : 0,
        callbacks
      };
      let reqBody, method = 'Post';
      if (type === 1) {
        reqBody = data;
        method = 'Put';
        const res = await EditStrategy(reqBody, curBusiItem.id, detail.id);
        if (res.err) {
          message.error(res.error);
        } else {
          message.success('编辑成功！');
          history.push('/strategy');
        }
      } else {
        reqBody = [data];
        const { dat } = await addOrEditStrategy(reqBody, curBusiItem.id, method);
        let errorNum = 0;
        const msg = Object.keys(dat).map((key) => {
          dat[key] && errorNum++;
          return (
            <p style={{ color: dat[key] ? '#ff4d4f' : '#52c41a' }}>
              {key}: {dat[key] ? dat[key] : 'successfully'}
            </p>
          );
        });
        notification.info({
          message: msg,
        });
        if (!errorNum) {
          history.push('/strategy');
        }
      }

    });
  };

  return (
    <div className='operate_con'>
      <Form
        {...layout}
        form={form}
        className='strategy-form'
        layout={refresh ? 'horizontal' : 'horizontal'}
        initialValues={{
          prom_eval_interval: 15,
          disabled: 0, // 0:立即启用 1:禁用  待修改
          notify_recovered: 1, // 1:启用
          cluster: 'Default', // 生效集群
          enable_days_of_week: ['1', '2', '3', '4', '5', '6', '0'],
          ...detail,
          enable_time: detail?.enable_stime ? [moment(detail.enable_stime, 'HH:mm'), moment(detail.enable_etime, 'HH:mm')] : [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')],
          enable_status: detail?.disabled === undefined ? true : !detail?.disabled,
          callbacks: !!detail?.callbacks ? detail.callbacks.map(item => ({
            url: item
          })) : [{}]
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
              initialValue={2}
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
                rules={[{ required: true, message: t('请输入PromQL') }]}

              >
                <PromqlEditor
                  // className='promql-editor' 
                  xCluster='Default'
                />
              </Form.Item>
            </Form.Item>
            <Form.Item
              required
              label={t('执行频率')}
              rules={[
                {
                  required: true,
                  message: t('执行频率不能为空'),
                },
              ]}
            >
              <Space>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  name='prom_eval_interval'
                  initialValue={15}
                  wrapperCol={{ span: 10 }}
                >
                  <InputNumber
                    min={1}
                    onChange={(val) => {
                      setRefresh(!refresh);
                    }} />
                </Form.Item>
                秒
                <Tooltip
                  title={t(
                    `每隔${form.getFieldValue('prom_eval_interval')}秒，把PromQL作为查询条件，去查询后端存储，如果查到了数据就表示当次有监控数据触发了规则`,
                  )}
                >
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
                <Form.Item
                  style={{ marginBottom: 0 }}
                  name='prom_for_duration'
                  initialValue={60}
                  wrapperCol={{ span: 10 }}
                >
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
            <Form.Item
              label={t('附加标签')}
              style={{
                marginTop: 20,
              }}
              name='append_tags'
            >
              <Select
                mode='tags'
                onChange={handleTagsChange}
                placeholder={t('请输入附加标签，格式为key=value')}
              ></Select>
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
          </Card>
          <Card title={t('通知配置')}>
            <Form.Item label={t('通知媒介')} name='notify_channels'>
              <Checkbox.Group>{contactListCheckboxes}</Checkbox.Group>
            </Form.Item>
            <Form.Item label={t('告警接收组')} name='notify_groups'>
              <Select mode='multiple'>{notifyGroupsOptions}</Select>
            </Form.Item>
            <Form.Item
              label={t('启用恢复通知')}
              name='notify_recovered'
              valuePropName='checked'
            >
              <Space>
                <Switch />
                <Tooltip
                  title={t(
                    `告警恢复时也发送通知`,
                  )}
                >
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
                  <InputNumber min={0} onChange={(val) => {
                    setRefresh(!refresh);
                  }} />
                </Form.Item>
                分钟
                <Tooltip
                  title={t(
                    `如果告警持续未恢复，间隔${form.getFieldValue(
                      'notify_repeat_step',
                    )}分钟之后重复提醒告警接收组的成员`,
                  )}
                >
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
                          <Form.Item
                            name={[field.name, 'url']}
                            fieldKey={[field.fieldKey, 'url']}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col span={1}>
                          <MinusCircleOutlined
                            className='control-icon-normal'
                            onClick={() => remove(field.name)}
                          />
                        </Col>
                      </Row>
                    ))}
                    <PlusCircleOutlined
                      className='control-icon-normal'
                      onClick={() => add()}
                    />
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
            <Button
              type='primary'
              onClick={addSubmit}
              style={{ marginRight: '8px' }}
            >
              {type === 1 ? t('编辑') : type === 2 ? t('克隆') : t('创建')}
            </Button>

            <Button
              onClick={() => {
                history.push('/strategy');
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
