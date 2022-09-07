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
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Form, Input, Card, Select, Col, Button, Row, message, DatePicker, Tooltip, Spin, Space } from 'antd';
import { QuestionCircleFilled, PlusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import {addShield, editShield} from '@/services/shield';
import { getBusiGroups } from '@/services/common';
import { shieldItem } from '@/store/warningInterface';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import AdvancedWrap from '@/components/AdvancedWrap';
import TagItem from './tagItem';
import { timeLensDefault } from '../../const';
import CateSelect from './CateSelect';
import ClusterSelect from './ClusterSelect';
import '../index.less';

const { Option } = Select;
const { TextArea } = Input;

interface ItagsObj {
  tags: any[];
  cluster: string;
}
interface Props {
  detail?: shieldItem;
  tagsObj?: ItagsObj;
  type?: number; // 1:创建; 2:克隆 3:编辑
}

const OperateForm: React.FC<Props> = ({ detail = {}, type, tagsObj = {} }: any) => {
  const btimeDefault = new Date().getTime();
  const etimeDefault = new Date().getTime() + 1 * 60 * 60 * 1000; // 默认时长1h
  const { t } = useTranslation();
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
  const [timeLen, setTimeLen] = useState('1h');
  const { curBusiItem, busiGroups } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);

  useEffect(() => {
    if (!filteredBusiGroups.length) {
      setFilteredBusiGroups(busiGroups);
    }
  }, [JSON.stringify(busiGroups)]);

  useEffect(() => {
    const btime = form.getFieldValue('btime');
    const etime = form.getFieldValue('etime');
    if (!!etime && !!btime) {
      const d = moment.duration(etime - btime).days();
      const h = moment.duration(etime - btime).hours();
      const m = moment.duration(etime - btime).minutes();
      const s = moment.duration(etime - btime).seconds();
    }
    if (curBusiItem) {
      form.setFieldsValue({ busiGroup: curBusiItem.id });
    } else if (filteredBusiGroups.length > 0) {
      form.setFieldsValue({ busiGroup: filteredBusiGroups[0].id });
    } else {
      message.warning('无可用业务组');
      history.push('/alert-mutes');
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
        cluster: [tagsObj.cluster],
        busiGroup: tagsObj.group_id,
      });
    }
    if (tagsObj?.cate) {
      form.setFieldsValue({
        cate: tagsObj?.cate,
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
    const tags = values?.tags?.map((item) => {
      return {
        ...item,
        value: Array.isArray(item.value) ? item.value.join(' ') : item.value,
      };
    });
    const params = {
      ...values,
      cluster: values.cluster.join(' '),
      btime: moment(values.btime).unix(),
      etime: moment(values.etime).unix(),
      tags,
    };
    const curBusiItemId = form.getFieldValue('busiGroup');
    if (type == 1) {
      editShield(params, curBusiItemId, detail.id).then((_) => {
        message.success(t('编辑告警屏蔽成功'));
        history.push('/alert-mutes');
      });
    } else {
      addShield(params, curBusiItemId).then((_) => {
        message.success(t('新建告警屏蔽成功'));
        history.push('/alert-mutes');
      });
    }

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

  const [fetching, setFetching] = useState(false);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setFilteredBusiGroups([]);
      setFetching(true);

      getBusiGroups(value).then((res) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setFilteredBusiGroups(res.dat || []);
        setFetching(false);
      });
    };

    return _.debounce(loadOptions, 500);
  }, []);

  const content = (
    <Form
      form={form}
      {...layout}
      layout='vertical'
      className='operate-form'
      onFinish={onFinish}
      initialValues={{
        ...detail,
        btime: detail?.btime ? moment(detail.btime * 1000) : moment(btimeDefault),
        etime: detail?.etime ? moment(detail.etime * 1000) : moment(etimeDefault),
        cluster: detail.cluster ? detail.cluster.split(' ') : ['$all'], // 生效集群
      }}
    >
      <Card>
        <Form.Item
            label={t('规则备注：')}
            name='note'
            rules={[
              {
                required: true,
                message: t('规则备注不能为空'),
              },
            ]}
        >
          <Input placeholder={t('请输入规则备注')} />
        </Form.Item>

        <Form.Item label={t('业务组：')} name='busiGroup'>
          <Select showSearch filterOption={false} suffixIcon={<CaretDownOutlined />} onSearch={debounceFetcher} notFoundContent={fetching ? <Spin size='small' /> : null}>
            {_.map(filteredBusiGroups, (item) => (
              <Option value={item.id} key={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <AdvancedWrap var='VITE_IS_ALERT_ES_DS'>
          {(visible) => {
            return <CateSelect form={form} visible={visible} />;
          }}
        </AdvancedWrap>
        <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
          {({ getFieldValue }) => {
            return <ClusterSelect form={form} cate={getFieldValue('cate')} />;
          }}
        </Form.Item>

        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label={t('屏蔽开始时间：')} name='btime'>
              <DatePicker showTime onChange={timeChange} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('屏蔽时长：')}>
              <Select suffixIcon={<CaretDownOutlined />} placeholder={t('请选择屏蔽时长')} onChange={timeLenChange} value={timeLen}>
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
          <Space>
            <Button type='primary' htmlType='submit'>
              {type === 1 ? t('编辑') : type===2? t('克隆'):t('创建')}
            </Button>
            <Button onClick={() => window.history.back()}>{t('取消')}</Button>
          </Space>
        </Form.Item>
      </Card>
    </Form>
  );
  return <div className='operate-form-index'>{content}</div>;
};

export default OperateForm;
