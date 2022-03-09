import React, { useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import _ from 'lodash';
import { Range } from '@/components/DateRangePicker';
import Timeseries from './Timeseries';
import Stat from './Stat';
import { VariableType } from '../../VariableConfig';

interface IProps {
  time: Range;
  step: number | null;
  getFieldsValue: any;
  variableConfig?: VariableType;
}

/**
 * 因为使用了 setFieldsValue 不会触发 shouldUpdate，这里只能把 values 作为状态，然后抛出 reload 接口
 * 在切换图表类型的时候手动 reload 下
 * TODO: 后面再看下怎么优雅的处理这块
 *  */

function index(props: IProps, ref) {
  const { time, step, variableConfig, getFieldsValue } = props;
  const values = getFieldsValue();
  const [realValues, setRealValues] = useState(values);
  const { type } = values;
  useImperativeHandle(ref, () => ({
    reload: () => {
      setRealValues(getFieldsValue());
    },
  }));
  useEffect(() => {
    setRealValues(values);
  }, [JSON.stringify(values)]);
  const subProps = {
    time,
    step,
    variableConfig,
    values: realValues,
  };
  if (_.isEmpty(realValues)) return null;
  const RendererCptMap = {
    timeseries: <Timeseries {...subProps} />,
    stat: <Stat {...subProps} />,
  };
  return <div style={{ border: '1px solid #d9d9d9', height: 200 }}>{RendererCptMap[type] || `无效的图表类型 ${type}`}</div>;
}

export default forwardRef(index);
