import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Card, Select, Col, Button, Row, message, Checkbox, Tooltip, Radio, Modal } from 'antd';
import { QuestionCircleFilled, PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import RuleModal from './ruleModal';
import TagItem from './tagItem';
import { addSubscribe, editSubscribe, deleteSubscribes } from '@/services/subscribe';
import { getNotifiesList, getTeamInfoList } from '@/services/manage';
import { useHistory } from 'react-router';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import '../index.less';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

const { Option } = Select;
const { TextArea } = Input;

interface Props {
  detail?: subscribeItem;
  type?: number; // 1:编辑; 2:克隆
}

const OperateForm: React.FC<Props> = ({ detail = {}, type }) => {
  const { t, i18n } = useTranslation();
  const { clusters: clusterList } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const layout = {
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 24,
    },
  };
  const tailLayout = {
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 24,
    },
  };

  const [form] = Form.useForm(null as any);
  const history = useHistory();
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [ruleModalShow, setRuleModalShow] = useState<boolean>(false);
  const [ruleCur, setRuleCur] = useState<any>();
  const [contactList, setInitContactList] = useState([]);
  const [littleAffect, setLittleAffect] = useState(true);
  const [notifyGroups, setNotifyGroups] = useState<any[]>([]);

  useEffect(() => {
    getNotifyChannel();
    getGroups('');
  }, []);

  useEffect(() => {
    setRuleCur({
      id: detail.rule_id || 0,
      name: detail.rule_name,
    });
  }, [detail.rule_id]);

  const notifyGroupsOptions = (detail.user_groups ? detail.user_groups.filter((item) => !notifyGroups.find((i) => item.id === i.id)) : []).concat(notifyGroups).map((ng: any) => (
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
    setNotifyGroups(data || []);
  };

  const debounceFetcher = useCallback(_.debounce(getGroups, 800), []);

  const onFinish = (values) => {
    setBtnLoading(true);
    const tags = values?.tags?.map((item) => {
      return {
        ...item,
        value: Array.isArray(item.value) ? item.value.join(' ') : item.value,
      };
    });
    const params = {
      ...values,
      tags,
      redefine_severity: values.redefine_severity ? 1 : 0,
      redefine_channels: values.redefine_channels ? 1 : 0,
      rule_id: ruleCur.id,
      user_group_ids: values.user_group_ids ? values.user_group_ids.join(' ') : '',
      new_channels: values.new_channels ? values.new_channels.join(' ') : '',
    };
    if (type === 1) {
      editSubscribe([{ ...params, id: detail.id }], curBusiItem.id)
        .then((_) => {
          message.success(t('编辑订阅规则成功'));
          history.push('/alert-subscribes');
        })
        .finally(() => {
          setBtnLoading(false);
        });
    } else {
      addSubscribe(params, curBusiItem.id)
        .then((_) => {
          message.success(t('新建订阅规则成功'));
          history.push('/alert-subscribes');
        })
        .finally(() => {
          setBtnLoading(false);
        });
    }
  };

  const onFinishFailed = () => {
    setBtnLoading(false);
  };

  const chooseRule = () => {
    setRuleModalShow(true);
  };

  const subscribeRule = (val) => {
    setRuleModalShow(false);
    setRuleCur(val);
    form.setFieldsValue({
      rile_id: val.id || 0,
    });
  };

  return (
    <>
      <div className='operate-form-index' id={littleAffect ? 'littleAffect' : ''}>
        <Form
          form={form}
          {...layout}
          layout='vertical'
          className='operate-form'
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            ...detail,
            cluster: clusterList[0] || 'Default',
            redefine_severity: detail?.redefine_severity ? true : false,
            redefine_channels: detail?.redefine_channels ? true : false,
            user_group_ids: detail?.user_group_ids ? detail?.user_group_ids?.split(' ') : [],
            new_channels: detail?.new_channels?.split(' '),
          }}
        >
          <Card>
            <Form.Item
              label={t('生效集群：')}
              name='cluster'
              rules={[
                {
                  required: true,
                  message: t('生效集群不能为空'),
                },
              ]}
            >
              <Select>
                {clusterList?.map((item, index) => (
                  <Option value={item} key={index}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={t('订阅告警规则：')}>
              {!!ruleCur?.id && (
                <Button
                  type='primary'
                  ghost
                  style={{ marginRight: '8px' }}
                  onClick={() => {
                    ruleCur?.id && history.push(`/alert-rules/edit/${ruleCur?.id}`);
                  }}
                >
                  {ruleCur?.name}
                </Button>
              )}

              <EditOutlined style={{ cursor: 'pointer', fontSize: '18px' }} onClick={chooseRule} />
              {!!ruleCur?.id && <DeleteOutlined style={{ cursor: 'pointer', fontSize: '18px', marginLeft: 5 }} onClick={() => subscribeRule({})} />}
            </Form.Item>
            <Row gutter={[10, 10]} style={{ marginBottom: '8px' }}>
              <Col span={5}>
                {t('订阅事件标签Key：')}
                <Tooltip title={t(`这里的标签是指告警事件的标签，通过如下标签匹配规则过滤告警事件`)}>
                  <QuestionCircleFilled />
                </Tooltip>
              </Col>
              <Col span={3}>{t('运算符：')}</Col>
              <Col span={16}>{t('标签Value：')}</Col>
            </Row>
            <Form.List name='tags' initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <TagItem field={field} fields={fields} key={index} remove={remove} add={add} form={form} />
                  ))}
                  <Form.Item>
                    <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item label={t('告警级别：')} name='redefine_severity' valuePropName='checked'>
              <Checkbox
                value={1}
                style={{ lineHeight: '32px' }}
                onChange={(e) => {
                  form.setFieldsValue({
                    redefine_severity: e.target.checked ? 1 : 0,
                  });
                  setLittleAffect(!littleAffect);
                }}
              >
                {t('重新定义')}
              </Checkbox>
            </Form.Item>
            <Form.Item label={t('新的告警级别：')} name='new_severity' initialValue={2} style={{ display: form.getFieldValue('redefine_severity') ? 'block' : 'none' }}>
              <Radio.Group>
                <Radio key={1} value={1}>
                  {t('一级报警')}
                </Radio>
                <Radio key={2} value={2}>
                  {t('二级报警')}
                </Radio>
                <Radio key={3} value={3}>
                  {t('三级报警')}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label={t('通知媒介：')} name='redefine_channels' valuePropName='checked'>
              <Checkbox
                value={1}
                style={{ lineHeight: '32px' }}
                onChange={(e) => {
                  form.setFieldsValue({
                    redefine_channels: e.target.checked ? 1 : 0,
                  });
                  setLittleAffect(!littleAffect);
                }}
              >
                {t('重新定义')}
              </Checkbox>
            </Form.Item>
            <Form.Item label={t('新的通知媒介：')} name='new_channels' style={{ display: form.getFieldValue('redefine_channels') ? 'block' : 'none' }}>
              <Checkbox.Group>
                {contactList.map((c: string) => (
                  <Checkbox value={c} key={c}>
                    {c}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>

            <Form.Item label={t('订阅告警接收组：')} name='user_group_ids' rules={[{ required: true, message: t('告警接收组不能为空') }]}>
              <Select mode='multiple' showSearch optionFilterProp='children' filterOption={false} onSearch={(e) => debounceFetcher(e)} onBlur={() => getGroups('')}>
                {notifyGroupsOptions}
              </Select>
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type='primary' htmlType='submit' style={{ marginRight: '8px' }}>
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
                        detail?.id &&
                          deleteSubscribes({ ids: [detail.id] }, curBusiItem.id).then(() => {
                            message.success(t('删除成功'));
                            history.push('/alert-subscribes');
                          });
                      },

                      onCancel() {},
                    });
                  }}
                >
                  {t('删除')}
                </Button>
              )}
              <Button onClick={() => window.history.back()}>{t('取消')}</Button>
            </Form.Item>
          </Card>
        </Form>
        <RuleModal
          visible={ruleModalShow}
          ruleModalClose={() => {
            setRuleModalShow(false);
          }}
          subscribe={subscribeRule}
        />
      </div>
    </>
  );
};

export default OperateForm;
