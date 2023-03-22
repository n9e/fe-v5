import React, { useEffect, useState } from 'react';
import { Row, Col, Select } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useDebounceFn } from 'ahooks';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { DatasourceCateEnum } from '@/utils/constant';
import { getInfluxdbMeasures, getInfluxdbTagfields } from '../services';

interface IProps {
  datasourceCate: DatasourceCateEnum.influxDB;
  datasourceName: string;
  dbname: string;
}

function AdvancedSettings(props: IProps) {
  const { datasourceCate, datasourceName, dbname } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<{
    measurement: string;
    tag: string;
    field: string;
  }>({
    measurement: '',
    tag: '',
    field: '',
  });
  const [options, setOptions] = useState<{
    measurement: string[];
    tag: string[];
    field: string[];
  }>({
    measurement: [],
    tag: [],
    field: [],
  });
  const { run: fetchData } = useDebounceFn(
    (type: 'measures' | 'tagfields') => {
      if (type === 'measures') {
        getInfluxdbMeasures({
          cate: datasourceCate,
          cluster: datasourceName,
          dbname: dbname,
        }).then((res) => {
          setOptions({
            ...options,
            measurement: res,
          });
        });
      } else if (type === 'tagfields') {
        getInfluxdbTagfields({
          cate: datasourceCate,
          cluster: datasourceName,
          dbname: dbname,
          measurement: values.measurement,
        }).then((res) => {
          setOptions({
            ...options,
            tag: res.tags,
            field: res.fields,
          });
        });
      }
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (dbname) {
      fetchData('measures');
    }
  }, [dbname]);

  useEffect(() => {
    if (values.measurement) {
      fetchData('tagfields');
    }
  }, [values.measurement]);

  return (
    <div>
      <div
        style={{
          marginBottom: 8,
        }}
      >
        <span
          onClick={() => {
            setOpen(!open);
          }}
          style={{
            cursor: 'pointer',
          }}
        >
          {open ? <DownOutlined /> : <RightOutlined />} {t('查询辅助')}
        </span>
      </div>
      <div
        style={{
          display: open ? 'block' : 'none',
        }}
      >
        <Row gutter={8}>
          <Col span={8}>
            <InputGroupWithFormItem label={t('数据表列表')} labelWidth={100}>
              <Select
                style={{ width: '100%' }}
                value={values.measurement}
                onChange={(val) => {
                  setValues({
                    ...values,
                    measurement: val,
                  });
                }}
              >
                {_.map(options.measurement, (item) => {
                  return (
                    <Select.Option value={item} key={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </InputGroupWithFormItem>
          </Col>
          <Col span={8}>
            <InputGroupWithFormItem label={t('Tag列表')} labelWidth={100}>
              <Select
                style={{ width: '100%' }}
                value={values.tag}
                onChange={(val) => {
                  setValues({
                    ...values,
                    tag: val,
                  });
                }}
              >
                {_.map(options.tag, (item) => {
                  return (
                    <Select.Option value={item} key={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </InputGroupWithFormItem>
          </Col>
          <Col span={8}>
            <InputGroupWithFormItem label={t('Field列表')} labelWidth={100}>
              <Select
                style={{ width: '100%' }}
                value={values.field}
                onChange={(val) => {
                  setValues({
                    ...values,
                    field: val,
                  });
                }}
              >
                {_.map(options.field, (item) => {
                  return (
                    <Select.Option value={item} key={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AdvancedSettings;
