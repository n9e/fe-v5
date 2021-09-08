import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Row, Col, Select, Table, Input } from 'antd';
import { GetMetrics } from '@/services/metric';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
const { Option } = Select;
interface Column {
  title: string;
  dataIndex: string;
}
interface Props {
  value?: string;
  multiple?: boolean;
  onChange: Function;
  idents?: Array<string>;
  initVal?: Metric;
}
export interface Metric {
  name: string;
  description: string;
}

const MetricTable = (
  { onChange, idents, multiple = true, value, initVal }: Props,
  ref: any,
) => {
  const { t } = useTranslation();
  const [selMetrics, setSelMetrics] = useState<Metric[] | string>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [historyMetrics, setHistoryMetrics] = useState<Metric[]>([]);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    getMetrics();
  }, [JSON.stringify(idents)]);

  useEffect(() => {
    value && setSelMetrics(value);
  }, [value]);
  useEffect(() => {
    if (historyMetrics.length && initVal && initVal['name']) {
      !flag && multiple && handleSelectChange([initVal['name']]);
      setFlag(true);
    }
  }, [historyMetrics]);

  const getMetrics = (query = '') => {
    if (query.length > 0 && query.length < 4) return; //因为后端性能问题，必须传入4字符才发起检索
    const queryData = {
      limit: 150,
      metric: query,
      idents,
    };
    GetMetrics(queryData).then((res) => {
      if (res.dat.metrics) {
        let history = res.dat.metrics.concat(historyMetrics);
        let Metrics = res.dat.metrics;
        if (initVal && initVal['name']) {
          history = res.dat.metrics.concat(historyMetrics).concat(initVal);
          Metrics = res.dat.metrics.concat(initVal);
        }
        setMetrics(Metrics);
        setHistoryMetrics(history);
      }
    });
  };

  const handleSelectChange = (select) => {
    setSelMetrics(select); // 因为要把description展示在chart上所以反选出该对象；antd的 Select中的value不能为对象？
    if (multiple) {
      let matricObjList = select.map((item) => {
        return historyMetrics.find((i) => i.name === item); // search之后metrics中不包含select的所有项，所以反查会丢项，需要记录所有查询过的metrics来反查
      });
      onChange(matricObjList);
    } else {
      onChange(select);
    }
  };

  const handleSearch = debounce((value) => {
    getMetrics(value);
  }, 500);
  const reset = () => {
    handleSelectChange([]);
  };

  useImperativeHandle(ref, () => ({
    reset,
  }));
  return (
    <>
      <Select
        mode={multiple ? 'multiple' : undefined}
        style={{
          width: '100%',
        }}
        placeholder={t('请输入监控指标(输入4个以上字符发起检索)')}
        value={selMetrics}
        onChange={handleSelectChange}
        onSearch={handleSearch}
        onDeselect={() => {
          // hack logic, 当选中项被全部删除后需要重置options，但是此时读到的selMetrics仍有1项
          if (selMetrics.length <= 1) {
            getMetrics();
          }
        }}
        // filterOption={false}
        showSearch
        dropdownClassName='overflow-586'
      >
        {metrics.map((item, i) => {
          return (
            <Option key={i} value={item.name}>
              {item.name} {item.description}
            </Option>
          );
        })}
      </Select>
    </>
  );
};

export default forwardRef(MetricTable);
