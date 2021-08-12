import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Select } from 'antd';
const { Option } = Select;
import { GetTagPairs } from '@/services/metric';
import { useTranslation } from 'react-i18next';
interface Props {
  onChange: Function;
  metrics: string[];
}

const MatricTag = (props: Props, ref: any) => {
  const { t } = useTranslation();
  const [tags, setTags] = useState<string[]>([]);
  const [selTags, setSelTags] = useState<string[]>([]);
  useEffect(() => {
    getTagPairs(undefined);
  }, [props.metrics]);

  const getTagPairs = (tags) => {
    let params = props.metrics.map((metric) => ({
      metric,
    }));
    if (params.length === 0) return;
    GetTagPairs({
      limit: 3000,
      params,
      tags,
    }).then((res) => {
      if (res.dat.tags) {
        setTags(res.dat.tags);
      }
    });
  };

  const handleSelectChange = (options) => {
    setSelTags(options);
    props.onChange(options);
    let tags = options.map((item) => {
      let [key, value] = item.split('=');
      return {
        key,
        value,
      };
    });
    getTagPairs(tags);
  };

  const reset = () => {
    handleSelectChange([]);
  };

  useImperativeHandle(ref, () => ({
    reset,
  }));
  return (
    <Select
      mode='multiple'
      style={{
        width: '100%',
      }}
      value={selTags}
      placeholder={t('请选择标签')}
      onChange={handleSelectChange}
    >
      {tags.map((item, i) => {
        return (
          <Option key={i} value={item}>
            {item}
          </Option>
        );
      })}
    </Select>
  );
};

export default forwardRef(MatricTag);
