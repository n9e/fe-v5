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
/**
 * 环比组件
 * 会更新 endTime, 防止最近一小时 & 相对时间环比一小时数据可粒度正确
 */
import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Button, Dropdown, Menu, Select, Tag, Popover, Input, InputNumber } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons'
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

  render() {
    const { curComparison } = this.state;
    const handleClick = (e) => {
      const index = this.state.curComparison.findIndex(cc => cc === e.key)
      let newCurComparison
      if (index === -1) {
        newCurComparison = [
          ...this.state.curComparison,
          e.key
        ]
        this.setState({
          curComparison: newCurComparison
        })
      } else {
        let curComparisonCopy = [...this.state.curComparison]
        curComparisonCopy.splice(index, 1)
        newCurComparison = curComparisonCopy
        this.setState({
          curComparison: curComparisonCopy
        })
      }
      const { onChange, relativeTimeComparison, comparisonOptions } = this.props;
      onChange({
        ...this.refresh(),
        comparison: newCurComparison,
        relativeTimeComparison,
        comparisonOptions,
      });
    }
    const menu = (
      <Menu onClick={handleClick} selectedKeys={curComparison}>
        <Menu.Item key='1d'>1d</Menu.Item>
        <Menu.Item key='7d'>7d</Menu.Item>
      </Menu>
    )
    return (
      <div className="graph-config-inner-comparison">
        {/* <Select
          dropdownMatchSelectWidth={false}
          mode="multiple"
          style={{ minWidth: 80, width: 'auto', verticalAlign: 'middle' }}
          value={curComparison}
          onChange={this.handleComparisonChange}>
          <Option key={'1d'} value={'1d'}>1天</Option>
          <Option key={'7d'} value={'7d'}>7天</Option>
        </Select> */}
        {this.state.curComparison.map(cc =>
          <Tag key={cc} closable onClose={e => {
            handleClick({key: cc})
          }}>
            {cc}
          </Tag>
        )}
        <Dropdown overlay={menu}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <PlusCircleOutlined />
          </a>
        </Dropdown>
      </div>
    );
  }
}
