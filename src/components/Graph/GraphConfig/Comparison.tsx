/**
 * 环比组件
 * 会更新 endTime, 防止最近一小时 & 相对时间环比一小时数据可粒度正确
 */
import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Button, Select, Popover, Input, InputNumber } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface Props {
  size: 'small' | 'default' | 'large' | undefined,
  comparison: string[],
  relativeTimeComparison: boolean,
  comparisonOptions: any[],
  graphConfig: any,
  onChange: (values: any) => void,
}

interface State {
  customValue?: number,
  customType: string,
  errorText: string,
  curComparison: Array<string>
}

const Option = Select.Option;
const customTypeOptions = [
  {
    value: 'hour',
    label: '小时',
    ms: 3600000,
  }, {
    value: 'day',
    label: '天',
    ms: 86400000,
  },
];

export default class Comparison extends Component<Props, State> {
  static defaultProps = {
    size: 'small',
    comparison: [],
    relativeTimeComparison: false,
    comparisonOptions: [],
    graphConfig: null,
    onChange: _.noop,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      customValue: undefined, // 自定义环比值(不带单位)
      customType: 'hour', // 自定义环比值单位 hour | day
      errorText: '', // 错误提示文本
      curComparison: []
    };
  }

  refresh = () => {
    const { graphConfig } = this.props;
    if (graphConfig) {
      const now = moment();
      const start = (Number(now.format('x')) - Number(graphConfig.end)) + Number(graphConfig.start) + '';
      const end = now.format('x');

      return { now: end, start, end };
    }
    return {};
  }

  handleComparisonChange = (value: string[]) => {
    const { onChange, relativeTimeComparison, comparisonOptions } = this.props;
    this.setState({
      curComparison: value
    })
    onChange({
      ...this.refresh(),
      comparison: value,
      relativeTimeComparison,
      comparisonOptions,
    });
  }

  handleRelativeTimeComparisonChange = (e: CheckboxChangeEvent) => {
    const { onChange, comparison, comparisonOptions } = this.props;
    onChange({
      ...this.refresh(),
      comparison,
      relativeTimeComparison: e.target.checked,
      comparisonOptions,
    });
  }

  handleCustomValueChange = (value: number | undefined) => {
    if (value) {
      this.setState({
        customValue: value,
        errorText: '',
      });
    } else {
      this.setState({
        customValue: value,
        errorText: '自定义值不能为空',
      });
    }
  }

  handleCustomTypeChange = (value: string) => {
    this.setState({ customType: value });
  }

  handleCustomBtnClick = () => {
    const { onChange, comparison, relativeTimeComparison, comparisonOptions } = this.props;
    const { customValue, customType } = this.state;
    const currentCustomTypeObj = _.find(customTypeOptions, { value: customType });

    if (!customValue || !currentCustomTypeObj) {
      this.setState({
        errorText: '自定义值不能为空',
      });
    } else {
      this.setState({
        errorText: '',
      }, () => {
        const ms = currentCustomTypeObj.ms * customValue;
        const comparisonOptionsClone = _.cloneDeep(comparisonOptions);
        const comparisonClone = _.cloneDeep(comparison);
        comparisonClone.push(_.toString(ms));
        comparisonOptionsClone.push({
          label: `${customValue}${currentCustomTypeObj.label}`,
          value: _.toString(ms),
        });
        const newComparisonOptions = _.unionBy(comparisonOptionsClone, 'value');
        onChange({
          ...this.refresh(),
          comparison: comparisonClone,
          relativeTimeComparison,
          comparisonOptions: newComparisonOptions,
        });
      });
    }
  }

  render() {
    const { curComparison } = this.state;
    return (
      <div className="graph-config-inner-comparison">
        <Select
          dropdownMatchSelectWidth={false}
          mode="multiple"
          style={{ minWidth: 80, width: 'auto', verticalAlign: 'middle' }}
          value={curComparison}
          onChange={this.handleComparisonChange}>
          <Option key={'1d'} value={'1d'}>1天</Option>
          <Option key={'7d'} value={'7d'}>7天</Option>
        </Select>
      </div>
    );
  }
}
