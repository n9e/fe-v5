import React, { useState, useEffect, useCallback } from 'react';
import { Form, Select, AutoComplete, Col, FormInstance } from 'antd';
import { tagFilterConditions } from '../../const';
import { getTagKeys, getTagValuesByKey } from '@/services/warning';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { Metric } from '@/store/warningInterface';

type tagFilterCondition = {
  value: string;
  multiple: boolean;
};
const multipleFuncs = tagFilterConditions
  .filter((r) => r.multiple)
  .map((r) => r.value);

interface Props {
  field: FormListFieldData;
  tagKeys: string[];
  curMetric: Metric;
  form: FormInstance;
}
const TagFilterCondition = (props: Props) => {
  const { t } = useTranslation();
  const { Option } = Select;
  const { tagKeys, field, form } = props;
  const [tagValues, setTagValues] = useState<Array<string>>([]);
  const [fuzzySearchKeyOptions, setFuzzySearchKeyOptions] = useState<
    {
      value: string;
    }[]
  >([]);
  const [fuzzySearchValueOptions, setFuzzySearchValueOptions] = useState<
    {
      value: string;
    }[]
  >([]);
  const [fuzzySearchKey, setFuzzySearchKey] = useState('');
  const [fuzzySearchValue, setFuzzySearchValue] = useState('');
  const [func, setFunc] = useState();

  const tagFilterConditionOptions = tagFilterConditions.map(
    (c: tagFilterCondition) => (
      <Option key={c.value} value={c.value}>
        {c.value}
      </Option>
    ),
  );
  useEffect(() => {
    if (tagKeys?.length === 0) return;
    getTagValuesByKey({
      tag_key: tagKeys[0],
      params: [
        {
          metric: props.curMetric || '',
        },
      ],
      limit: 50,
    }).then((res) => {
      setTagValues(res?.dat?.values || []);
    });
  }, []);

  // https://www.freecodecamp.org/news/debounce-and-throttle-in-react-with-hooks/
  const debouncedChangeTagKey = useCallback(
    _.debounce((v) => {
      if (!v) return;
      getTagValuesByKey({
        tag_key: v,
        params: [
          {
            metric: props.curMetric || '',
          },
        ],
        limit: 50,
      }).then((res) => {
        setTagValues(res?.dat?.values || []);
      });
    }, 1000),
    [],
  );

  const handleChangeTagKey = (v) => {
    debouncedChangeTagKey(v);
  };

  const debouncedGetTagKeys = useCallback(
    _.debounce((v) => {
      setFuzzySearchKey(v);
      const getTagKeysParam = {
        params: [
          {
            metric: props.curMetric || '',
          },
        ],
        limit: 50,
        tag_key: v,
      };
      getTagKeys(getTagKeysParam).then((res) => {
        setFuzzySearchKeyOptions(
          res.dat.keys.map((k) => ({
            value: k,
          })),
        );
      });
    }, 1000),
    [],
  );

  const handleFuzzySearchTagKey = (v) => {
    debouncedGetTagKeys(v);
  };

  const debouncedGetTagValues = useCallback(
    _.debounce((v) => {
      if (!v) return;
      setFuzzySearchValue(v);
      getTagValuesByKey({
        tag_key: v,
        params: [
          {
            metric: props.curMetric || '',
          },
        ],
        limit: 50,
      }).then((res) => {
        setFuzzySearchValueOptions(
          res.dat.values.map((k) => ({
            value: k,
          })),
        );
      });
    }, 1000),
    [],
  );

  const handleFuzzySearchTagValue = (v) => {
    debouncedGetTagValues(v);
  };
  return (
    <>
      <Col span={8}>
        <Form.Item name={[field.name, 'key']} initialValue={tagKeys?.[0]}>
          <AutoComplete
            placeholder={t('请输入标签key')}
            onChange={handleChangeTagKey}
            onSearch={handleFuzzySearchTagKey}
            options={
              fuzzySearchKey
                ? fuzzySearchKeyOptions
                : tagKeys.map((k) => ({
                    value: k,
                  }))
            }
          ></AutoComplete>
        </Form.Item>
      </Col>
      <Col span={7}>
        <Form.Item
          name={[field.name, 'func']}
          initialValue={tagFilterConditions[0].value}
        >
          <Select>{tagFilterConditionOptions}</Select>
        </Form.Item>
      </Col>

      <Col span={7}>
        {multipleFuncs.includes(
          form.getFieldValue(['tags_filters', field.name, 'func']),
        ) ? (
          <Form.Item
            name={[field.name, 'params']}
            initialValue={tagValues?.[0]}
          >
            <Select
              mode='tags'
              placeholder={t('请输入标签value')}
              onSearch={handleFuzzySearchTagValue}
            >
              {fuzzySearchValue
                ? fuzzySearchValueOptions.map((o) => (
                    <Option key={o.value} value={o.value}>
                      {o.value}
                    </Option>
                  ))
                : (tagValues || []).map((v) => (
                    <Option key={v} value={v}>
                      {v}
                    </Option>
                  ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item name={[field.name, 'params', 0]}>
            <AutoComplete
              onSearch={handleFuzzySearchTagValue}
              options={
                fuzzySearchValue
                  ? fuzzySearchValueOptions
                  : (tagValues || []).map((k) => ({
                      value: k,
                    }))
              }
            ></AutoComplete>
          </Form.Item>
        )}
      </Col>
    </>
  );
};

export default TagFilterCondition;
