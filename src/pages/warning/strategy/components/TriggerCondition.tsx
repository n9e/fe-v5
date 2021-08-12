import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Row,
  Col,
  AutoComplete,
  Tooltip,
} from 'antd';
import _ from 'lodash';
import { funcMap } from '../../const';
import { Metric } from '@/store/warningInterface';
import { GetMetrics } from '@/services/metric';
import { FundOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const TriggerConditon = (props) => {
  const { t, i18n } = useTranslation();
  const defaultFunc = 'all';
  const defaultOptr = '=';
  const defaultParams = [];
  const defaultThreshold = 60;
  const { field, expression, alertDuration, form, openDrawer, index } = props;
  const [func, setFunc] = useState(expression?.func || defaultFunc);
  const [params, setParams] = useState(expression?.params || defaultParams);
  const [threshold, setThreshold] = useState(
    expression?.threshold !== undefined
      ? expression?.threshold
      : defaultThreshold,
  );
  const [metric, setMetric] = useState(expression?.metric);
  const [metricDesc, setMetricDesc] = useState('');
  const [metricOptions, setMetricOptions] = useState<Metric[]>([]);
  const [optr, setOptr] = useState(expression?.optr || defaultOptr);
  const { Option } = Select;
  useEffect(() => {
    if (metric) {
      GetMetrics({
        limit: 1,
        metric,
      }).then((res) => {
        setMetricDesc(
          res?.dat?.metrics?.[0]?.description ||
            res?.dat?.metrics?.[0]?.name ||
            '',
        );
      });
    }

    // GetMetrics({ metric: 'system_' }).then((res) => {
    //   setMetricOptions(res?.dat?.metrics);
    // });
  }, []);
  // const metricOptions = metrics.map((m: Metric) => {
  //   return (
  //     <Option key={m.name} value={m.name}>
  //       {m.description || m.name}
  //     </Option>
  //   );
  // });

  const funcOptions = Object.keys(funcMap(t)).map((k: string) => (
    <Option key={k} value={k}>
      {funcMap(t)[k].label}
    </Option>
  ));
  const renderParams = useCallback(() => {
    return funcMap(t)[func].params.map((p, i) => (
      <Fragment key={i}>
        <Col
          span={1}
          style={{
            lineHeight: '32px',
            color: 'rgb(255, 183, 39)',
          }}
        >
          {p}：
        </Col>
        <Col span={2}>{funcParams(i)}</Col>
      </Fragment>
    ));
  }, [func, funcMap(t)[func].params]);

  const funcParams = (i) => {
    const minnum = ['diff', 'pdiff'].indexOf(func) > -1 ? 2 : 1;
    let ParamValue; // let val = Number(params[i]);

    if (i === 0) {
      if (
        func === 'c_avg_rate_abs' ||
        func === 'c_avg_rate' ||
        func === 'c_avg_abs' ||
        func === 'c_avg'
      ) {
        // 相对天数
        // val = params[i] !== 1 ? params[i] : 86400;
        // console.log('funcParams params', params, val);
        ParamValue = (
          <Select // value={val}
          // onChange={(newVal) => {
          //   handleParamsChange(i, newVal);
          // }}
          >
            <Option value={86400} key={86400}>
              1
            </Option>
            <Option value={604800} key={604800}>
              7
            </Option>
          </Select>
        );
      }

      if (func === 'happen' || func === 'ndiff' || func === 'stddev') {
        // 发生次数
        ParamValue = (
          <InputNumber // value={val}
            min={minnum}
            style={{
              width: '100%',
            }} // onChange={(newVal) => {
            //   handleParamsChange(i, newVal);
            // }}
          />
        );
      }
    }

    return (
      <Form.Item
        name={[field.name, 'params', 0]}
        fieldKey={[field.fieldKey, 'params']}
        initialValue={expression?.params[i]}
        style={{
          marginBottom: 0,
        }}
      >
        {ParamValue}
      </Form.Item>
    );
  };

  const funcPreview = () => {
    const str = funcMap(t)[func].meaning;
    const index1 = str.indexOf('$n');
    const index2 = str.indexOf('$m');
    const index3 = str.lastIndexOf('$v');
    const nPrefix = str.substring(0, index1);
    const vPostfix = str.substring(index3 + 2);
    let mVal;

    if (
      func === 'c_avg_rate_abs' ||
      func === 'c_avg_rate' ||
      func === 'c_avg_abs' ||
      func === 'c_avg'
    ) {
      let params = form.getFieldValue('trigger_conditions')[field.name]?.params;
      mVal = params.length > 0 && params[0] !== 1 ? params[0] / 86400 : 1;
    } else {
      mVal = params[0] || 1;
    }

    let n = (
      <strong
        style={{
          color: '#2DB7F5',
        }}
      >
        {alertDuration}
      </strong>
    );
    const m = (
      <strong
        style={{
          color: '#FFB727',
        }}
      >
        {mVal}
      </strong>
    );
    const v = (
      <strong
        style={{
          color: '#FF6F27',
        }}
      >
        {optr && threshold !== undefined ? optr + ' ' + threshold : '${v}'}
      </strong>
    );

    if (['diff', 'pdiff'].indexOf(func) > -1) {
      n = (
        <strong
          style={{
            color: '#2DB7F5',
          }}
        >
          {alertDuration}
        </strong>
      );
    }

    let previewNode = (
      <span>
        {nPrefix}
        {n}
      </span>
    );
    let nPostfix = str.substring(index1 + 2);

    if (index2 > -1) {
      const mPrefix = str.substring(index1 + 2, index2);
      previewNode = (
        <span>
          {previewNode}
          {mPrefix}
          {m}
        </span>
      );
      nPostfix = str.substring(index2 + 2);
    }

    if (func !== 'stddev') {
      // eslint-disable-next-line no-underscore-dangle
      const _index = index2 > -1 ? index2 : index1;

      const vPrefix = str.substring(_index + 2, index3);
      previewNode = (
        <span>
          {previewNode}
          {vPrefix}
          {v}
          {vPostfix}
        </span>
      );
    } else {
      previewNode = (
        <span>
          {previewNode}
          {nPostfix}
        </span>
      );
    }

    return (
      <div>
        {
          <span
            style={{
              color: '#999',
            }}
          >
            {t('预览')}：
          </span>
        }
        <span
          style={{
            paddingRight: 5,
          }}
        >
          {metricDesc || '${metric}'}
        </span>
        {previewNode}
      </div>
    );
  };

  const handleFuncChange = (v) => {
    setFunc(v); // setParams(funcMap[v].defaultValue);
  };

  const handleThreshholdChange = (v) => {
    setThreshold(v);
  };

  const handleChangeOptr = (v) => {
    setOptr(v);
  };

  const handleMetricChange = (v) => {
    props.handleMetricChange();
    setMetric(v);
    let dst = metricOptions.find((m) => m.name === v);
    dst && setMetricDesc(dst.description || dst.name);
  };

  useEffect(() => {
    return () => {
      props.handleMetricChange();
    };
  }, []);

  // const onSearch = (metric: string) => {
  //   if (metric.length > 0 && metric.length < 4) return;
  //   console.log('onSearch', metric);
  //   GetMetrics({
  //     metric,
  //   }).then((res) => {
  //     setMetricOptions(res?.dat?.metrics);
  //   });
  // };

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (metric: string) => {
      if (metric.length > 0 && metric.length < 4) return;
      GetMetrics({
        metric,
      }).then((res) => {
        setMetricOptions(res?.dat?.metrics);
      });
    };

    return _.debounce(loadOptions, 500);
  }, []);

  const handleMetricFocus = () => {
    let metric = form.getFieldValue('trigger_conditions')[field.name]?.metric;
    if (metric && metric.length > 0 && metric.length < 4) return;
    GetMetrics({
      metric,
    }).then((res) => {
      setMetricOptions(res?.dat?.metrics);
    });
  };

  const formatOption = (item: Metric): string => {
    return item.name + ' ' + item.description;
  };

  return (
    <Card
      style={{
        width: '100%',
        marginBottom: 20,
        background: 'rgb(244, 245, 248)',
      }}
    >
      <Row gutter={[10, 10]}>
        <Col span={10}>
          <Form.Item
            name={[field.name, 'metric']}
            fieldKey={[field.fieldKey, 'metric']}
            initialValue={expression?.metric}
            style={{
              marginBottom: 0,
            }}
          >
            <AutoComplete
              onFocus={handleMetricFocus}
              onChange={handleMetricChange}
              onSearch={debounceFetcher}
              placeholder={t('请输入监控指标(输入4个以上字符发起检索)')}
            >
              {metricOptions &&
                metricOptions.map((item, i) => (
                  <Option key={i} value={item.name}>
                    {formatOption(item)}
                  </Option>
                ))}
            </AutoComplete>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item
            name={[field.name, 'func']}
            fieldKey={[field.fieldKey, 'func']}
            initialValue={expression?.func || defaultFunc}
            style={{
              marginBottom: 0,
            }}
          >
            <Select
              onChange={handleFuncChange}
              dropdownClassName='overflow-230'
            >
              {funcOptions}
            </Select>
          </Form.Item>
        </Col>
        {renderParams()}
        <Col
          span={1}
          style={{
            lineHeight: '32px',
            color: 'rgb(255, 111, 39)',
          }}
        >
          v：
        </Col>
        <Col span={2}>
          <Form.Item
            name={[field.name, 'optr']}
            fieldKey={[field.fieldKey, 'optr']}
            initialValue={expression?.optr || defaultOptr}
            style={{
              marginBottom: 0,
            }}
          >
            <Select onChange={handleChangeOptr}>
              <Option value='=' key='equal'>
                =
              </Option>
              <Option value='>' key='greater'>
                &gt;
              </Option>
              <Option value='>=' key='greaterEqual'>
                &gt;=
              </Option>
              <Option value='<' key='less'>
                &lt;
              </Option>
              <Option value='<=' key='lessEqual'>
                &lt;=
              </Option>
              <Option value='!=' key='notEqual'>
                !=
              </Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={5}>
          <Row>
            <Col span={21}>
              <Form.Item
                name={[field.name, 'threshold']}
                fieldKey={[field.fieldKey, 'threshold']}
                initialValue={expression?.threshold || defaultThreshold}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('请输入百分比')}
                  onChange={handleThreshholdChange}
                />
              </Form.Item>
            </Col>
            <Col span={1} offset={2}>
              <Tooltip
                title={t('预览')}
                overlayClassName='trigger-condition-preview'
              >
                <FundOutlined
                  style={{ lineHeight: '33px' }}
                  className='openDrawer-icon'
                  onClick={() => {
                    openDrawer(index);
                  }}
                />
              </Tooltip>
            </Col>
          </Row>
        </Col>
        <Col span={24}>{funcPreview()}</Col>
      </Row>
    </Card>
  );
};

export default TriggerConditon;
