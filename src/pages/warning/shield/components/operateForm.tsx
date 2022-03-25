import React, { useState, useEffect } from 'react';
import { Form, Input, Card, Select, Col, Button, Row, message, DatePicker, Tooltip } from 'antd';
import { QuestionCircleFilled, PlusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import TagItem from './tagItem';
import { addShield } from '@/services/shield';
import { useHistory } from 'react-router';
import { shieldItem } from '@/store/warningInterface';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import '../index.less';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { timeLensDefault } from '../../const';

const { Option } = Select;
const { TextArea } = Input;

interface ItagsObj {
  tags: any[];
  cluster: string;
}
interface Props {
  detail?: shieldItem;
  tagsObj?: ItagsObj;
  type?: number; // 1:创建; 2:克隆
}

const OperateForm: React.FC<Props> = ({ detail = {}, type, tagsObj = {} }) => {
  const btimeDefault = new Date().getTime();
  const etimeDefault = new Date().getTime() + 1 * 60 * 60 * 1000; // 默认时长1h
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
      span: 0,
    },
    wrapperCol: {
      span: 24,
    },
  };

  const [form] = Form.useForm(null as any);
  const history = useHistory();
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [timeLen, setTimeLen] = useState('1h');
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);

  useEffect(() => {
    const btime = form.getFieldValue('btime');
    const etime = form.getFieldValue('etime');
    if (!!etime && !!btime) {
      const d = moment.duration(etime - btime).days();
      const h = moment.duration(etime - btime).hours();
      const m = moment.duration(etime - btime).minutes();
      const s = moment.duration(etime - btime).seconds();
    }
    return () => {};
  }, [form]);

  useEffect(() => {
    // 只有add 的时候才传入tagsObj
    if (tagsObj?.tags && tagsObj?.tags.length > 0) {
      const tags = tagsObj?.tags?.map((item) => {
        return {
          ...item,
          value: item.func === 'in' ? item.value.split(' ') : item.value,
        };
      });
      form.setFieldsValue({
        tags: tags || [{}],
        cluster: tagsObj.cluster,
      });
    }
  }, [tagsObj]);

  const timeChange = () => {
    const btime = form.getFieldValue('btime');
    const etime = form.getFieldValue('etime');
    if (!!etime && !!btime) {
      const d = Math.floor(moment.duration(etime - btime).asDays());
      const h = Math.floor(moment.duration(etime - btime).hours());
      const m = Math.floor(moment.duration(etime - btime).minutes());
      const s = Math.floor(moment.duration(etime - btime).seconds());
      const timeLen = `${d ? `${d}d ` : ''}${h ? `${h}h ` : ''}${m ? `${m}m ` : ''}${s ? `${s}s` : ''}`;
      setTimeLen(timeLen);
    }
  };

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
      btime: moment(values.btime).unix(),
      etime: moment(values.etime).unix(),
      tags,
    };
    addShield(params, curBusiItem.id)
      .then((_) => {
        message.success(t('新建告警屏蔽成功'));
        history.push('/alert-mutes');
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };
  const onFinishFailed = () => {
    setBtnLoading(false);
  };

  const timeLenChange = (val: string) => {
    setTimeLen(val);

    const time = new Date().getTime();
    if (val === 'forever') {
      const longTime = 7 * 24 * 3600 * 1000 * 10000;
      form.setFieldsValue({
        btime: moment(time),
        etime: moment(time).add({
          seconds: longTime,
        }),
      });
      return;
    }
    const unit = val.charAt(val.length - 1);
    const num = val.substr(0, val.length - 1);
    form.setFieldsValue({
      btime: moment(time),
      etime: moment(time).add({
        [unit]: num,
      }),
    });
  };

  const content = (
    <Form
      form={form}
      {...layout}
      layout='vertical'
      className='operate-form'
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{
        ...detail,
        btime: detail?.btime ? moment(detail.btime * 1000) : moment(btimeDefault),
        etime: detail?.etime ? moment(detail.etime * 1000) : moment(etimeDefault),
        cluster: clusterList[0] || 'Default',
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
            {clusterList?.map((item) => (
              <Option value={item} key={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label={t('屏蔽开始时间：')} name='btime'>
              <DatePicker showTime onChange={timeChange} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('屏蔽时长：')}>
              <Select placeholder={t('请选择屏蔽时长')} onChange={timeLenChange} value={timeLen}>
                {timeLensDefault.map((item: any, index: number) => (
                  <Option key={index} value={item.value}>
                    {item.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('屏蔽结束时间：')} name='etime'>
              <DatePicker showTime onChange={timeChange} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[10, 10]} style={{ marginBottom: '8px' }}>
          <Col span={5}>
            {t('屏蔽事件标签Key：')}
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
                <TagItem field={field} key={index} remove={remove} form={form} />
              ))}
              <Form.Item>
                <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* <Form.Item label={t('屏蔽时间')} name='time'>
          <RangeDatePicker />
        </Form.Item> */}
        <Form.Item
          label={t('屏蔽原因')}
          name='cause'
          rules={[
            {
              required: true,
              message: t('请填写屏蔽原因'),
            },
          ]}
        >
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Row gutter={[10, 10]}>
            <Col span={1}>
              <Button type='primary' htmlType='submit'>
                {type === 2 ? t('克隆') : t('创建')}
              </Button>
            </Col>

            <Col
              span={1}
              style={{
                marginLeft: 40,
              }}
            >
              <Button onClick={() => window.history.back()}>{t('取消')}</Button>
            </Col>
          </Row>
        </Form.Item>
      </Card>
    </Form>
  );
  return <div className='operate-form-index'>{content}</div>;
};

export default OperateForm;
