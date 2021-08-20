import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/pageLayout';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
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
  Spin,
  message,
  Drawer,
  Modal,
  Tooltip,
} from 'antd';
const { TextArea } = Input;
import { checkPromql } from '@/services/dashboard';
import moment from 'moment';
import {
  BarChartOutlined,
  FundOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import TriggerConditon from './components/TriggerCondition';
import {
  getTagKeys,
  getWarningStrategy,
  addOrEditStrategy,
} from '@/services/warning';
import { GetMetrics } from '@/services/metric';
import { getResourceGroups } from '@/services/resource';
import {
  getTeamInfoList,
  getUserInfoList,
  getNotifiesList,
} from '@/services/manage';
import ResourceFilterConditionComponent from './components/ResourceFilterCondition';
import {
  resourceFilterConditions,
  tagFilterConditions,
  funcMap,
} from '../const';
import TagFilterConditionComponent from './components/TagFilterCondition';
import {
  Expression,
  ResourceFilterCondition,
  TagFilterCondition,
  AppendTagFilterCondition,
  Metric,
} from '@/store/warningInterface';
import { User, Team, ContactsItem } from '@/store/manageInterface';
import { deleteStrategy } from '@/services/warning';
const { confirm } = Modal;
import { useTranslation } from 'react-i18next';
import '../index.less';
import ChartDrawer from './components/Drawer';
import { AlertDurationInput } from './components/AlertDurationInput';

const ThresholdInput = ({ onChange, value }) => {
  const { t } = useTranslation();
  return (
    <>
      <InputNumber onChange={onChange} value={value} /> {t('秒')}
    </>
  );
};

const defaultAlertDuration = 60;
const defaultPriority = 1;
const defaultStatus = 0;
const defaultEnableDayOfWeek = [1, 2, 3, 4, 5, 6, 7];
const defaultRecoveryDuration = 0;
const defaultRecoveryNotify = false;
const defaultType = 0;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const { Option } = Select;

const StrategyOperate: React.FC = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory(); // 创建的时候默认选中的值

  const [form] = Form.useForm();
  const query = useQuery();
  const isClone = query.get('mode');
  const [alertDuration, setAlertDuration] = useState(defaultAlertDuration);
  const [initInitialValues, setInitInitialValues] = useState({});
  const [initTriggerConditions, setInitTriggerConditions] = useState<
    Expression[]
  >([]);
  const [initResourceFilterConditions, setInitResourceFilterConditions] =
    useState<ResourceFilterCondition[]>([]);
  const [initTagFilterConditions, setInitTagFilterConditions] = useState<
    TagFilterCondition[]
  >([]);
  const [initCallbacks, setInitCallbacks] = useState<Array<string>>([]);
  const [recoveryDuration, setRecoveryDuration] = useState(false);
  const [tagKeys, setTagKeys] = useState<Array<string>>([]);
  // const [metrics, setMetrics] = useState<Array<Metric>>([]);
  const [metricsDrawer, setMetricsDrawer] = useState<Array<Metric>>([]);

  const [classpathes, setClasspathes] = useState([]);
  const [notifyGroups, setNotifyGroups] = useState([]);
  const [notifyUsers, setNotifyUsers] = useState([]);
  const [contactList, setInitContactList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [curStrategyObj, setCurStrategyObj] = useState<any>({});
  const [allMetrics, setAllMetrics] = useState<Array<Metric>>([]);
  const [curGroupId, setCurGroupId] = useState<number | string>();
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [yplotline, setYplotline] = useState<number>(0);
  const createEmptyExpression = (defaultMetric) => ({
    optr: '=',
    func: Object.keys(funcMap(t))[0],
    metric: defaultMetric,
    params: [],
    threshold: defaultAlertDuration,
  });

  const getCurWarningStrategy = () => {
    const addModeNullObjPromise = Promise.resolve(null);
    return curStrategyId
      ? getWarningStrategy(curStrategyId)
      : addModeNullObjPromise;
  };

  const routeParams: any = useParams();
  const curStrategyId = routeParams.id;
  const curGroupIdFromUrl = routeParams.group_id;
  useEffect(() => {
    Promise.all([
      // GetMetrics({
      //   limit: 150,
      // }),
      getResourceGroups(),
      getTeamInfoList(),
      getUserInfoList(),
      getNotifiesList(),
      getCurWarningStrategy(),
    ]).then(
      ([
        // metricsRes,
        rgRes,
        teamInfoListRes,
        userInfoListRes,
        contactsListRes,
        curStrategyObjRes,
      ]) => {
        let curStrategyObj = curStrategyObjRes?.dat;
        setCurStrategyObj(curStrategyObj);
        let initTriggerConditions = [
          // createEmptyExpression(metricsRes?.dat?.metrics[0].name || ''),
          createEmptyExpression(''),
        ];
        let initResourceFilterConditions = [
          // createEmptyResourceFilterCondition(rgRes?.dat?.list[0]?.path || -1),
          // createEmptyResourceFilterCondition(),
        ];
        let initCallbacks = [''];
        let contactList = contactsListRes || [];
        form.setFieldsValue({
          type: defaultType,
          priority: defaultPriority,
          alert_duration: defaultAlertDuration,
          status: defaultStatus,
          enable_days_of_week: defaultEnableDayOfWeek,
          enable_time: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')],
          recovery_duration: defaultRecoveryDuration,
          recovery_notify: defaultRecoveryNotify,
          notify_channels: [],
          notify_groups: [],
          notify_users: [],
          runbook_url: '',
          note: '',
        }); // 编辑的场景，curStrategyObj为要编辑的策略对象

        if (curStrategyObj) {
          if (curStrategyObj?.expression?.trigger_conditions?.length > 0) {
            initTriggerConditions =
              curStrategyObj?.expression?.trigger_conditions;

            const curMetricList =
              curStrategyObj?.expression?.trigger_conditions.map(
                (item) => item.metric,
              );

            fetchTagKey(curMetricList);
          }

          if (curStrategyObj?.expression?.res_filters?.length > 0) {
            initResourceFilterConditions =
              curStrategyObj?.expression?.res_filters;
            form.setFieldsValue({
              res_filters: initResourceFilterConditions,
            });
          }

          if (curStrategyObj?.callbacks) {
            initCallbacks = curStrategyObj?.callbacks.split(' ');
          }

          if (curStrategyObj?.expression.together_or_any) {
            form.setFieldsValue({
              together_or_any: curStrategyObj?.expression.together_or_any,
            });
          }

          if (curStrategyObj?.expression?.evaluation_interval) {
            form.setFieldsValue({
              evaluation_interval:
                curStrategyObj?.expression?.evaluation_interval,
            });
          }

          if (curStrategyObj?.expression?.promql) {
            form.setFieldsValue({
              promql: curStrategyObj?.expression?.promql,
            });
          }

          if (curStrategyObj.group_id) {
            setCurGroupId(curStrategyObj.group_id);
          }

          form.setFieldsValue({
            id: curStrategyObj.id,
            name: isClone
              ? 'Copy of ' + curStrategyObj.name
              : curStrategyObj.name,
            priority: curStrategyObj.priority,
            type: curStrategyObj.type,
            alert_duration: curStrategyObj.alert_duration,
            status: curStrategyObj.status,
            enable_days_of_week: curStrategyObj.enable_days_of_week
              .split(' ')
              .map((s) => Number(s)),
            enable_time: [
              moment(curStrategyObj.enable_stime, 'HH:mm'),
              moment(curStrategyObj.enable_etime, 'HH:mm'),
            ],
            recovery_duration: curStrategyObj.recovery_duration,
            recovery_notify: curStrategyObj.recovery_notify,
            notify_channels: curStrategyObj.notify_channels.split(' '),
            notify_groups:
              curStrategyObj.notify_groups.length > 0
                ? curStrategyObj.notify_groups.split(' ').map((i) => Number(i))
                : [],
            notify_users:
              curStrategyObj.notify_users.length > 0
                ? curStrategyObj.notify_users.split(' ').map((i) => Number(i))
                : [],
            runbook_url: curStrategyObj.runbook_url,
            note: curStrategyObj.note,
            append_tags: curStrategyObj.append_tags
              ? curStrategyObj.append_tags.split(' ')
              : [],
          });
        }

        setInitTriggerConditions(initTriggerConditions);
        setInitResourceFilterConditions(initResourceFilterConditions);
        setInitCallbacks(initCallbacks);
        setInitContactList(contactList);
        let aTeamInfoList = teamInfoListRes?.dat?.list || [];
        setNotifyGroups(aTeamInfoList);
        let aUserInfoList = userInfoListRes?.dat?.list || [];
        setNotifyUsers(aUserInfoList);
        // setMetrics(metricsRes.dat.metrics);
        setClasspathes(rgRes.dat.list);
        setIsLoading(false);
        // 以下为给 标签过滤 赋默认值逻辑
        let initTagFilterConditions = [];

        if (curStrategyObj) {
          curStrategyObj?.expression?.tags_filters?.length > 0 &&
            (initTagFilterConditions =
              curStrategyObj?.expression?.tags_filters);
        }

        setInitTagFilterConditions(initTagFilterConditions);
        form.setFieldsValue({
          tags_filters: initTagFilterConditions,
        });
        return curStrategyObj;
      },
    );
  }, []);

  const fetchTagKey = (metricList?) => {
    const filterAllMetrics = metricList
      ? metricList
      : allMetrics.filter((metric) => metric);
    if (filterAllMetrics.length === 0) return;
    const params = filterAllMetrics.map((metric) => ({
      metric,
    }));
    const getTagKeysParam = {
      limit: 50,
      params,
    };
    getTagKeys(getTagKeysParam).then((tagkeysRes) => {
      setTagKeys(tagkeysRes?.dat?.keys || []);
    });
  };

  const onThresholdChange = (v) => {
    setAlertDuration(v);
  };

  const onRecoveryDurationChange = (e) => {
    setRecoveryDuration(e?.target?.checked || 0);
  };

  const handleMetricChange = debounce(() => {
    let a = form.getFieldValue('trigger_conditions').map((tc) => tc.metric);
    setAllMetrics(a);
    // 每次metric变化都将tag清空
    setInitTagFilterConditions([]);
    form.setFieldsValue({
      tags_filters: [],
    });
  }, 500);

  const layout = {
    labelCol: {
      span: 2,
    },
    wrapperCol: {
      span: 22,
    },
  };
  const tailLayout = {
    wrapperCol: {
      offset: 2,
    },
  };

  const onFinish = (values) => {
    let transportData = JSON.parse(JSON.stringify(values));
    const {
      evaluation_interval,
      promql,
      trigger_conditions,
      res_filters,
      tags_filters,
      together_or_any,
    } = transportData;
    transportData.expression =
      transportData.type === 0
        ? {
            together_or_any,
            trigger_conditions,
            res_filters,
            tags_filters,
          }
        : {
            evaluation_interval,
            promql,
          };
    delete transportData.trigger_conditions;
    delete transportData.res_filters;
    delete transportData.tags_filters;
    transportData.enable_days_of_week =
      transportData.enable_days_of_week.join(' ');
    transportData.enable_stime = values.enable_time[0].format('HH:mm');
    transportData.enable_etime = values.enable_time[1].format('HH:mm');
    delete transportData.enable_time;
    transportData.notify_channels = transportData.notify_channels.join(' ');
    transportData.notify_groups = transportData.notify_groups.join(' ');
    transportData.notify_users = transportData.notify_users.join(' ');
    transportData.callbacks = transportData.callbacks
      .map((c) => c.url)
      .join(' '); // recovery_notify代表是否不发送恢复通知

    transportData.recovery_notify = +transportData.recovery_notify;
    transportData.group_id = curGroupIdFromUrl
      ? Number(curGroupIdFromUrl)
      : Number(curGroupId);
    let operatePromise =
      curStrategyId && !isClone
        ? addOrEditStrategy([transportData], curStrategyId)
        : addOrEditStrategy([transportData]);
    operatePromise.then((res) => {
      console.log(res);

      if (res.err === '') {
        console.log(t('添加成功'), res);
        message.success(
          isClone
            ? t('克隆成功')
            : curStrategyId
            ? t('保存成功')
            : t('创建成功'),
        );
        history.push('/strategy');
      } else {
        message.error(
          isClone
            ? t('克隆失败')
            : curStrategyId
            ? t('保存失败')
            : t('创建失败'),
        );
      }
    });
    transportData.append_tags = transportData.append_tags?.join(' ') || '';
  };

  const onFinishFailed = ({ values, errorFields, outOfDate }) => {
    if (errorFields.length > 0) {
      document.querySelector(`#${errorFields[0].name[0]}`)?.scrollIntoView();
    }
  }; // 这里的value写成i + 1这种数字类型，antd会报警：Select组件的mode参数是tag时，不应该是数字类型，需要是字符串类型
  // 但如果写成字符串，给默认值选中时，select会显示 1 2 3，而不是 周一 周二 周三

  const enableDaysOfWeekOptions = [
    t('周一'),
    t('周二'),
    t('周三'),
    t('周四'),
    t('周五'),
    t('周六'),
    t('周日'),
  ].map((v, i) => {
    return <Option value={i + 1} key={i}>{`${v}`}</Option>;
  });
  const notifyGroupsOptions = notifyGroups.map((ng: Team) => (
    <Option value={ng.id} key={ng.id}>
      {ng.name}
    </Option>
  ));
  const notifyUsersOptions = notifyUsers.map((u: User) => (
    <Option value={u.id} key={u.id}>
      {u.username}
    </Option>
  ));
  const contactListCheckboxes = contactList.map((c: string) => (
    <Checkbox value={c} key={c}>
      {c}
    </Checkbox>
  ));

  const handleTagsChange = (value: string[]) => {
    let top: string = value[value.length - 1];
    let reg = /\w+=\w+/;

    if (top && !reg.test(top)) {
      let v = value.pop();
      message.error(`"${v}${t('"不符合输入规范（格式为key=value）')}`);
    }
  };

  const handleFuncChange = (i) => {
    const { res_filters } = form.getFieldsValue();
    console.log(res_filters);

    res_filters[i].params = [];
    form.setFieldsValue({
      res_filters,
    });
  };

  const validator = debounce((rule, value, callback) => {
    checkPromql(value).then((res) => {
      if (res.dat.ql_correct) {
        callback();
      } else {
        callback(res.dat.parse_error);
      }
    });
  }, 1000);

  const openDrawer = function (index?) {
    let tab = form.getFieldValue('type');
    if (tab === 0) {
      let metricArr = form.getFieldValue('trigger_conditions');
      if (!metricArr[index].metric) {
        message.warning(t('请先输入指标'));
        return;
      }
      let metricStrArr = [{ name: metricArr[index].metric, description: '' }];
      setYplotline(metricArr[index].threshold);
      setMetricsDrawer(metricStrArr);
    } else if (tab === 1) {
      // 这里是textarea
      let promql = form.getFieldValue('promql');
      if (!promql) {
        message.warning(t('请先输入指标'));
        return;
      }
      let metricStrArr = [{ name: '', promql, description: '' }];
      setMetricsDrawer(metricStrArr);
    }

    setDrawerVisible(true);
  };
  const radioChange = function (e) {
    // console.log(document.getElementById('ts-graph-1-tooltip')?.remove());
  };

  const OperateContent = (
    <Spin spinning={isLoading}>
      <Form
        {...layout}
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className='strategy-form'
      >
        <Card title={t('基本配置')}>
          <Form.Item
            label={t('策略名称')}
            name='name'
            rules={[
              {
                required: true,
                message: t('策略名称不能为空'),
              },
            ]}
          >
            <Input placeholder={t('请输入策略名称')} />
          </Form.Item>
          <Form.Item label={t('告警级别')} name='priority'>
            <Radio.Group>
              <Radio value={1}>{t('一级报警')}</Radio>
              <Radio value={2}>{t('二级报警')}</Radio>
              <Radio value={3}>{t('三级报警')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={t('触发模式')} name='type'>
            <Radio.Group onChange={radioChange}>
              <Radio.Button value={0}>nightingale</Radio.Button>
              <Radio.Button value={1}>prometheus</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {/* <Button
            onClick={() => {
              openDrawer();
            }}
          >
            查看预览图
          </Button> */}
          {drawerVisible && (
            <ChartDrawer
              visible={drawerVisible}
              onChange={(e) => {
                setDrawerVisible(e);
              }}
              yplotline={yplotline}
              metrics={metricsDrawer}
            ></ChartDrawer>
          )}

          <Form.Item label={t('统计周期')} name='alert_duration' required>
            <ThresholdInput
              onChange={onThresholdChange}
              value={alertDuration}
            />
          </Form.Item>

          <Form.Item
            shouldUpdate
            wrapperCol={{
              span: 24,
            }}
          >
            {() => {
              return form.getFieldValue('type') === 0 ? (
                <>
                  {initTriggerConditions.length > 0 && (
                    <Form.Item
                      label={t('触发条件')}
                      required
                      labelCol={{
                        span: 2,
                      }}
                      wrapperCol={{
                        span: 22,
                      }}
                    >
                      <Form.Item name='together_or_any' initialValue={0}>
                        <Radio.Group>
                          <Radio.Button value={0}>And</Radio.Button>
                          <Radio.Button value={1}>Or</Radio.Button>
                        </Radio.Group>
                      </Form.Item>

                      <Form.List
                        name='trigger_conditions'
                        initialValue={initTriggerConditions}
                        rules={[
                          {
                            validator: async (_, triggerConditions) => {
                              if (triggerConditions.length === 0) {
                                return Promise.reject(
                                  new Error('触发条件不能为空'),
                                );
                              }
                            },
                          },
                        ]}
                      >
                        {(fields, { add, remove }, { errors }) => (
                          <>
                            {fields.length ? (
                              fields.map((field, index) => (
                                <Row gutter={[10, 10]} key={field.key}>
                                  <Col span={21}>
                                    <TriggerConditon
                                      openDrawer={openDrawer}
                                      index={index}
                                      field={field}
                                      remove={remove}
                                      // metrics={metrics}
                                      form={form}
                                      expression={
                                        initTriggerConditions[field.key]
                                      }
                                      alertDuration={alertDuration}
                                      handleMetricChange={handleMetricChange}
                                    ></TriggerConditon>
                                  </Col>
                                  <Col span={1}>
                                    <MinusCircleOutlined
                                      className='control-icon-high'
                                      onClick={() => remove(field.name)}
                                    />
                                  </Col>
                                  {index === fields.length - 1 && (
                                    <Col span={1}>
                                      <PlusCircleOutlined
                                        className='control-icon-high'
                                        onClick={() => add()}
                                      />
                                    </Col>
                                  )}
                                </Row>
                              ))
                            ) : (
                              <PlusCircleOutlined
                                className='control-icon-high'
                                onClick={() => add()}
                              />
                            )}
                            <Form.ErrorList errors={errors} />
                          </>
                        )}
                      </Form.List>
                    </Form.Item>
                  )}
                  <Form.Item
                    label={t('资源过滤')}
                    labelCol={{
                      span: 2,
                    }}
                    wrapperCol={{
                      span: 22,
                    }}
                  >
                    <Form.List name='res_filters'>
                      {(fields, { add, remove }) => {
                        return (
                          <>
                            {fields.length ? (
                              fields.map((field, index) => (
                                <Row gutter={[10, 10]} key={field.key}>
                                  <ResourceFilterConditionComponent
                                    field={field} // initObj={initResourceFilterConditions[field.key]}
                                    classpathes={classpathes}
                                    onFuncChange={handleFuncChange}
                                  />
                                  <Col span={1}>
                                    <MinusCircleOutlined
                                      className='control-icon-normal'
                                      onClick={() => remove(field.name)}
                                    />
                                  </Col>
                                  <Col span={1}>
                                    <PlusCircleOutlined
                                      className='control-icon-normal'
                                      onClick={() => add()}
                                    />
                                  </Col>
                                </Row>
                              ))
                            ) : (
                              <Col span={1}>
                                <PlusCircleOutlined
                                  className='control-icon-normal'
                                  onClick={() => add()}
                                />
                              </Col>
                            )}
                          </>
                        );
                      }}
                    </Form.List>
                  </Form.Item>
                  <Form.Item
                    label={t('标签过滤')}
                    labelCol={{
                      span: 2,
                    }}
                    wrapperCol={{
                      span: 22,
                    }}
                  >
                    <Form.List name='tags_filters'>
                      {(fields, { add, remove }, { errors }) => (
                        <>
                          {fields.length ? (
                            fields.map((field, index) => (
                              <Row gutter={[10, 10]} key={field.key}>
                                <TagFilterConditionComponent
                                  field={field}
                                  tagKeys={tagKeys}
                                  form={form}
                                  curMetric={allMetrics?.[0] || ''}
                                />
                                <Col span={1}>
                                  <MinusCircleOutlined
                                    className='control-icon-normal'
                                    onClick={() => remove(field.name)}
                                  />
                                </Col>
                                {index === fields.length - 1 && (
                                  <Col span={1}>
                                    <PlusCircleOutlined
                                      className='control-icon-normal'
                                      onClick={() => add()}
                                    />
                                  </Col>
                                )}
                              </Row>
                            ))
                          ) : (
                            <Col span={1}>
                              <PlusCircleOutlined
                                className='control-icon-normal'
                                onClick={() => {
                                  add();
                                  fetchTagKey();
                                }}
                              />
                            </Col>
                          )}
                        </>
                      )}
                    </Form.List>
                  </Form.Item>
                </>
              ) : (
                <>
                  <Form.Item
                    label={t('执行频率')}
                    name='evaluation_interval'
                    labelCol={{
                      span: 2,
                    }}
                    wrapperCol={{
                      span: 22,
                    }}
                    initialValue={10}
                    required
                  >
                    <AlertDurationInput />
                  </Form.Item>
                  <Form.Item className={'Promeql-content'}>
                    <Form.Item
                      label='PromQL'
                      name='promql'
                      labelCol={{ span: 2 }}
                      wrapperCol={{ span: 22 }}
                      rules={[
                        { required: true, message: t('请输入PromQL') },
                        {
                          validator: validator,
                        },
                      ]}
                    >
                      <TextArea rows={2} />
                    </Form.Item>
                    <Tooltip title={t('预览')}>
                      <FundOutlined
                        className='Promeql-icon-btn'
                        onClick={() => {
                          openDrawer();
                        }}
                      />
                    </Tooltip>
                  </Form.Item>
                </>
              );
            }}
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
        </Card>
        <Card
          title={t('生效配置')}
          style={{
            marginTop: 20,
          }}
        >
          <Form.Item label={t('立即启用')} name='status'>
            <Radio.Group>
              <Radio value={0}>{t('是')}</Radio>
              <Radio value={1}>{t('否')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={t('生效时间')} name='enable_days_of_week'>
            <Select mode='tags'>{enableDaysOfWeekOptions}</Select>
          </Form.Item>
          <Form.Item name='enable_time' {...tailLayout}>
            <TimePicker.RangePicker format='HH:mm' />
          </Form.Item>
        </Card>
        <Card
          title={t('通知配置')}
          style={{
            marginTop: 20,
          }}
        >
          {/* <Form.Item label='留观时长' name='recovery_duration'>
          <RecoveryDuration
           onChange={onRecoveryDurationChange}
           value={recoveryDuration}
          />
          </Form.Item> */}
          <Form.Item
            label={t('静默恢复')}
            name='recovery_notify'
            valuePropName='checked'
          >
            <Checkbox>{t('不发送恢复通知')}</Checkbox>
          </Form.Item>
          <Form.Item label={t('通知媒介')} name='notify_channels'>
            <Checkbox.Group>{contactListCheckboxes}</Checkbox.Group>
          </Form.Item>
          <Form.Item label={t('报警接收团队')} name='notify_groups'>
            <Select mode='multiple'>{notifyGroupsOptions}</Select>
          </Form.Item>
          <Form.Item label={t('报警接收人')} name='notify_users'>
            <Select mode='multiple'>{notifyUsersOptions}</Select>
          </Form.Item>
          <Form.Item label={t('报警回调')}>
            {initCallbacks.length > 0 && (
              <Form.List name='callbacks' initialValue={initCallbacks}>
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.length ? (
                      fields.map((field, index) => (
                        <Row gutter={[10, 10]} key={field.key}>
                          <Col span={22}>
                            <Form.Item
                              name={[field.name, 'url']}
                              initialValue={initCallbacks[field.key]}
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
                          {index === fields.length - 1 && (
                            <Col span={1}>
                              <PlusCircleOutlined
                                className='control-icon-normal'
                                onClick={() => add()}
                              />
                            </Col>
                          )}
                        </Row>
                      ))
                    ) : (
                      <Col span={1}>
                        <PlusCircleOutlined
                          className='control-icon-normal'
                          onClick={() => add()}
                        />
                      </Col>
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        marginTop: 4,
                        color: '#ccc',
                      }}
                    >
                      {t(
                        '通知自己开发的系统（请确认是夜莺服务端可访问的地址）',
                      )}
                    </span>
                  </>
                )}
              </Form.List>
            )}
          </Form.Item>
        </Card>
        <Card
          title={t('其他配置')}
          style={{
            marginTop: 20,
          }}
        >
          <Form.Item label={t('预案链接')} name='runbook_url'>
            <Input />
          </Form.Item>
          <Form.Item label={t('备注')} name='note'>
            <Input />
          </Form.Item>
        </Card>
        <div className={'bottom-content'}>
          <Form.Item
            {...tailLayout}
            style={{
              marginTop: 20,
            }}
          >
            <Button type='primary' htmlType='submit'>
              {isClone ? t('克隆') : curStrategyId ? t('保存') : t('创建')}
            </Button>
            {isClone ? (
              []
            ) : curStrategyId ? (
              <Button
                type='primary'
                onClick={() => {
                  console.log(curStrategyId);
                  confirm({
                    title: t('是否删除该告警规则?'),
                    onOk: () => {
                      deleteStrategy(curStrategyId).then(() => {
                        message.success(t('删除成功'));
                        history.push('/strategy');
                      });
                    },

                    onCancel() {},
                  });
                }}
              >
                {t('删除')}
              </Button>
            ) : (
              []
            )}
            <Button
              onClick={() => {
                history.push('/strategy');
              }}
            >
              {t('取消')}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Spin>
  );
  return (
    <PageLayout title={t('strategy.single')} showBack>
      <Card
        style={{
          paddingBottom: 0,
        }}
      >
        {OperateContent}
      </Card>
    </PageLayout>
  );
};

export default StrategyOperate;
