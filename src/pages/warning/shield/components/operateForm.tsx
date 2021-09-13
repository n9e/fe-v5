import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Card,
  AutoComplete,
  Select,
  Col,
  Button,
  Row,
  message,
  Tag,
} from 'antd';
import { GetMetrics } from '@/services/metric';
import type { Metric } from '@/pages/metric/matric';
import RangeDatePicker from '@/components/FormComponents/RangeDatePicker';
import { addShield } from '@/services/shield';
import { useHistory } from 'react-router';
import { shieldItem, FormType, shieldDetail } from '@/store/warningInterface';
import { randomColor } from '@/utils/constant';
import dayjs from 'dayjs';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { eventStoreState } from '@/store/eventInterface';
import '../index.less';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { getResourceGroups } from '@/services';
import { SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG } from 'constants';

const { Option } = Select;
const { TextArea } = Input;
const reg = /\w+=\w+/;
interface Props {
  detail?: shieldItem;
  type?: string;
}

const OperateForm: React.FC<Props> = ({ detail, type = FormType.add }) => {
  const { t, i18n } = useTranslation();
  const layout = {
    labelCol: {
      span: i18n.language == 'en' ? 3 : 2,
    },
    wrapperCol: {
      span: i18n.language == 'en' ? 21 : 22,
    },
  };
  const tailLayout = {
    labelCol: {
      // span: i18n.language == 'en' ? 1 : 2,
    },
    wrapperCol: {
      offset: 2,
    },
  };
  const params = useParams<{
    from: string;
  }>();
  const { currentEdit } = useSelector<RootState, eventStoreState>(
    (state) => state.event,
  );
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [form] = Form.useForm(null as any);
  const history = useHistory();
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [classpathPrefixVal, setclasspathPrefixVal] = useState('');
  const [options, setOptions] = useState<{ value: string }[]>([]);
  const [Search, setSearch] = useState('');
  useEffect(() => {
    if (type === FormType.add && params.from === 'event' && currentEdit?.id) {
      const { history_points, res_ident, tags } = currentEdit;
      form.setFieldsValue({
        metric: history_points[0].metric,
        res_filters: res_ident,
        tags_filters: tags === '' ? [] : tags.split(' '),
      });
    }
  }, [params.from]);

  const validator = (rule, value, callback) => {
    let metric = form.getFieldValue('metric');
    let resFilters = form.getFieldValue('res_filters');
    let tagsFilters = form.getFieldValue('tags_filters');
    let classpathPrefixVal = form.getFieldValue('classpath_prefix');

    if (!metric && !resFilters && !tagsFilters && !classpathPrefixVal) {
      callback(
        new Error(t('屏蔽标识、资源标识、屏蔽标签、资源分组前缀不能同时为空')),
      );
    } else {
      callback();
    }
  };

  const getMetricsList = async (value?: string) => {
    const { dat, error } = await GetMetrics({
      metric: value,
    });
    setMetrics(dat.metrics);
  };

  useEffect(() => {
    getMetricsList();
  }, []);
  useEffect(() => {
    getResourceGroups(classpathPrefixVal).then((e) => {
      let paths = e.dat.list.map((e) => {
        return { value: e.path as string };
      });
      setOptions(paths);
    });
    form.setFieldsValue({ classpath_prefix: classpathPrefixVal });
  }, [classpathPrefixVal]);

  const handleTagsChange = (value: string[]) => {
    const top: string = value[value.length - 1];
    if (top && !reg.test(top)) {
      let v = value.pop();
      message.error(`${t('不符合输入规范（格式为key=value）')}`);
    }
  };

  const onFinish = (values) => {
    setBtnLoading(true);
    const params = {
      metric: values.metric,
      res_filters: values.res_filters,
      tags_filters: values?.tags_filters ? values.tags_filters.join(' ') : '',
      cause: values.cause,
      btime: values.time.btime,
      etime: values.time.etime,
      classpath_prefix: values.classpath_prefix,
    };
    addShield(params)
      .then((_) => {
        message.success(t('新建告警屏蔽成功'));
        history.push('/shield');
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };
  const onFinishFailed = () => {
    setBtnLoading(false);
  };
  const onSelect = _.debounce((data: string) => {
    setclasspathPrefixVal(data);
  }, 800);
  const onChange = _.debounce((data: string) => {
    setclasspathPrefixVal(data);
  }, 800);

  const content =
    type === FormType.add ? (
      <Form
        form={form}
        {...layout}
        className='operate-form'
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Card>
          <Form.Item
            label={t('屏蔽指标')}
            name='metric'
            rules={[
              {
                validator: validator,
              },
            ]}
          >
            <AutoComplete
              placeholder={t('请输入指标名称')}
              onSearch={_.debounce(getMetricsList, 1000)}
            >
              {metrics.map((item) => {
                return (
                  <Option key={item.name} value={item.name}>
                    {item.name} {item.description}
                  </Option>
                );
              })}
            </AutoComplete>
          </Form.Item>
          <Form.Item
            label={t('资源分组前缀')}
            name='classpath_prefix'
            rules={[
              {
                validator: validator,
              },
            ]}
          >
            <AutoComplete
              value={classpathPrefixVal}
              options={options}
              onSelect={onSelect}
              onChange={onChange}
              placeholder={t('搜索资源分组前缀')}
            />
          </Form.Item>
          <Form.Item
            label={t('资源标识')}
            name='res_filters'
            rules={[
              {
                validator: validator,
              },
            ]}
          >
            <Input placeholder={t('请输入资源标识的正则表达式')} />
          </Form.Item>
          <Form.Item
            label={t('屏蔽标签')}
            name='tags_filters'
            rules={[
              {
                validator: validator,
              },
            ]}
          >
            <Select
              mode='tags'
              dropdownStyle={{
                display: 'none',
              }}
              placeholder={t('请输入屏蔽标签(请用回车分割)')}
              onChange={handleTagsChange}
            ></Select>
          </Form.Item>

          <Form.Item label={t('屏蔽时间')} name='time'>
            <RangeDatePicker />
          </Form.Item>
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
            <Row gutter={[10, 10]} align='middle'>
              {i18n.language == 'en' ? (
                <Col span={1} offset={1}>
                  <Button type='primary' htmlType='submit' loading={btnLoading}>
                    {t('创建')}
                  </Button>
                </Col>
              ) : (
                <Col span={1}>
                  <Button type='primary' htmlType='submit' loading={btnLoading}>
                    {t('创建')}
                  </Button>
                </Col>
              )}

              <Col
                span={1}
                style={{
                  marginLeft: 40,
                }}
              >
                <Button onClick={() => window.history.back()}>
                  {t('取消')}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Card>
      </Form>
    ) : detail ? (
      <Form {...layout} className='operate-form'>
        <Card>
          <Form.Item label={t('屏蔽指标')}>{detail.metric}</Form.Item>
          <Form.Item label={t('资源标识')}>
            {detail.res_filters || <div>{t('暂无')}</div>}
          </Form.Item>
          <Form.Item label={t('屏蔽标签')}>
            {(detail.tags_filters &&
              detail.tags_filters
                .split(' ')
                .map((tag: string, index: number) => {
                  let i = Math.random() * randomColor.length;
                  let color = randomColor[Math.floor(i)];
                  return (
                    <Tag color={color} key={index}>
                      {tag}
                    </Tag>
                  );
                })) || <div>{t('暂无')}</div>}
          </Form.Item>
          <Form.Item label={t('屏蔽时间')}>
            {dayjs(detail.btime * 1000).format('YYYY-MM-DD HH:mm:ss')} -{' '}
            {dayjs(detail.etime * 1000).format('YYYY-MM-DD HH:mm:ss')}
          </Form.Item>
          <Form.Item label={t('屏蔽原因')}>{detail.cause}</Form.Item>
        </Card>
      </Form>
    ) : (
      <div></div>
    );
  return <div className='operate-form-index'>{content}</div>;
};

export default OperateForm;
