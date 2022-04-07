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
/* eslint-disable react/sort-comp */
/* eslint-disable prefer-template */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Dropdown, Menu, Select, Tag } from 'antd';
import { DownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import Comparison from './Comparison';
import * as config from '../config';
import { fetchAggrGroups } from '../api';
import { Config } from 'react-sortable-hoc';

const { Option } = Select;

/**
 * graph 内置配置条组件
 */

interface Props {
  data: any;
  onChange: Function;
}
interface State {
  curAggrFunc: string;
  calcFunc: string;
  curAggrGroups: string[];
  aggrGroups: string[];
  curComparisonValue: any;
}
class GraphConfigInner extends Component<Props, State> {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      curAggrFunc: 'avg',
      calcFunc: '',
      curAggrGroups: ['ident'],
      curComparisonValue: {},
      aggrGroups: [],
    };
  }

  componentDidMount() {
    this.fetchAggrGroups();
  }

  componentDidUpdate(prevProps) {
    const oldHosts = (prevProps.data.selectedHosts || []).map((h) => h.ident);
    const newHosts = (this.props.data.selectedHosts || []).map((h) => h.ident);
    const isHostsChanged = !_.isEqual(oldHosts, newHosts);
    if (isHostsChanged) {
      this.fetchAggrGroups();
    }
  }

  fetchAggrGroups() {
    const { metric, selectedHosts } = this.props.data;
    const idents = selectedHosts.map((host) => host.ident);
    fetchAggrGroups({
      start: Math.round(Number(this.props.data.start) / 1000),
      end: Math.round(Number(this.props.data.end) / 1000),
      match: [`${metric}{ident=~"${idents.join('|')}"}`],
    }).then((res) => {
      this.setState({
        aggrGroups: res.data,
      });
    });
  }

  handleAggrFuncChange = (val) => {
    const { data, onChange } = this.props;
    this.setState({
      curAggrFunc: val,
    });
    onChange('update', data.id, {
      changeType: 'aggrFuncChange',
      comparison: this.state.curComparisonValue.comparison,
      relativeTimeComparison: this.state.curComparisonValue.relativeTimeComparison,
      comparisonOptions: this.state.curComparisonValue.comparisonOptions,
      aggrFunc: val,
      calcFunc: this.state.calcFunc,
      aggrGroups: this.state.curAggrGroups,
    });
  };

  handleCalcFuncChange = (val) => {
    const { data, onChange } = this.props;
    this.setState({
      calcFunc: val,
    });
    onChange('update', data.id, {
      comparison: this.state.curComparisonValue.comparison,
      relativeTimeComparison: this.state.curComparisonValue.relativeTimeComparison,
      comparisonOptions: this.state.curComparisonValue.comparisonOptions,
      aggrFunc: this.state.curAggrFunc,
      calcFunc: val,
      aggrGroups: this.state.curAggrGroups,
    });
  };

  handleComparisonChange = (values) => {
    const { data, onChange } = this.props;
    this.setState({
      curComparisonValue: values,
    });
    onChange('update', data.id, {
      comparison: values.comparison,
      relativeTimeComparison: values.relativeTimeComparison,
      comparisonOptions: values.comparisonOptions,
      aggrFunc: this.state.curAggrFunc,
      calcFunc: this.state.calcFunc,
      aggrGroups: this.state.curAggrGroups,
    });
  };

  handleAggrGroupsChange = (values) => {
    const { data, onChange } = this.props;
    this.setState({
      curAggrGroups: values,
    });
    onChange('update', data.id, {
      comparison: this.state.curComparisonValue.comparison,
      relativeTimeComparison: this.state.curComparisonValue.relativeTimeComparison,
      comparisonOptions: this.state.curComparisonValue.comparisonOptions,
      aggrFunc: this.state.curAggrFunc,
      calcFunc: this.state.calcFunc,
      aggrGroups: values,
    });
  };

  render() {
    const { data, onChange } = this.props;
    const { now, start, end, comparison } = data;
    const handleAggrFuncClick = (e) => {
      this.handleAggrFuncChange(e.key);
    };
    const aggrFuncMenu = (
      <Menu onClick={handleAggrFuncClick} selectedKeys={[this.state.curAggrFunc]}>
        <Menu.Item key='sum'>sum</Menu.Item>
        <Menu.Item key='avg'>avg</Menu.Item>
        <Menu.Item key='max'>max</Menu.Item>
        <Menu.Item key='min'>min</Menu.Item>
      </Menu>
    );

    const calcFuncMenu = (
      <Menu onClick={(e) => this.handleCalcFuncChange(e.key === 'clear' ? '' : e.key)} selectedKeys={[this.state.calcFunc]}>
        <Menu.Item key='rate_1m'>rate_1m</Menu.Item>
        <Menu.Item key='rate_5m'>rate_5m</Menu.Item>
        <Menu.Item key='increase_1m'>increase_1m</Menu.Item>
        <Menu.Item key='increase_5m'>increase_5m</Menu.Item>
        <Menu.Divider></Menu.Divider>
        <Menu.Item key='clear'>clear</Menu.Item>
      </Menu>
    );

    const handleAggrGroupsClick = (ag) => {
      const index = this.state.curAggrGroups.findIndex((cag) => cag === ag.key);
      let newCurAggrGroups;
      if (index === -1) {
        newCurAggrGroups = [...this.state.curAggrGroups, ag.key];
        this.setState({
          curAggrGroups: newCurAggrGroups,
        });
      } else {
        let curComparisonCopy = [...this.state.curAggrGroups];
        curComparisonCopy.splice(index, 1);
        newCurAggrGroups = curComparisonCopy;
        this.setState({
          curAggrGroups: curComparisonCopy,
        });
      }
      this.handleAggrGroupsChange(newCurAggrGroups);
    };

    const aggrGroupsMenu = (
      <Menu onClick={handleAggrGroupsClick} selectedKeys={this.state.curAggrGroups}>
        {this.state.aggrGroups
          .filter((n) => n !== '__name__')
          .map((ag) => (
            <Menu.Item key={ag}>{ag}</Menu.Item>
          ))}
      </Menu>
    );

    const handleDeleteAggrGroupClick = (ag) => {
      let newCurAggrGroups = [...this.state.curAggrGroups];
      let idx = newCurAggrGroups.findIndex((cag) => cag === ag);
      if (idx >= 0) newCurAggrGroups.splice(idx, 1);
      this.handleAggrGroupsChange(newCurAggrGroups);
    };

    return (
      <div className='graph-config-inner'>
        <div className='graph-config-inner-item'>
          计算函数 ：
          <Dropdown overlay={calcFuncMenu}>
            <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
              {this.state.calcFunc} <DownOutlined />
            </a>
          </Dropdown>
        </div>
        <div className='graph-config-inner-item'>
          环比：
          <Comparison
            comparison={comparison}
            relativeTimeComparison={data.relativeTimeComparison}
            comparisonOptions={data.comparisonOptions}
            graphConfig={data}
            onChange={this.handleComparisonChange}
          />
          <input
            style={{
              position: 'fixed',
              left: -10000,
            }}
            id={`hiddenInput${data.id}`}
          />
        </div>
        <div className='graph-config-inner-item'>
          聚合函数 ：
          <Dropdown overlay={aggrFuncMenu}>
            <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
              {this.state.curAggrFunc} <DownOutlined />
            </a>
          </Dropdown>
        </div>
        {this.state.curAggrFunc ? (
          <div className='graph-config-inner-item'>
            <span>聚合维度 ：</span>
            {/* <Select
                mode="multiple"
                size="small"
                style={{ minWidth: 60 }}
                dropdownMatchSelectWidth={false}
                value={this.state.curAggrGroups}
                onChange={this.handleAggrGroupsChange}
              >
                {this.state.aggrGroups.map(ag => <Option key={ag} value={ag}>{ag}</Option>)}
              </Select> */}
            {this.state.curAggrGroups.map((ag) => (
              <Tag
                key={ag}
                closable
                onClose={(e) => {
                  handleDeleteAggrGroupClick(ag);
                }}
              >
                {ag}
              </Tag>
            ))}
            <Dropdown overlay={aggrGroupsMenu} overlayStyle={{ maxHeight: 400, overflow: 'auto' }}>
              <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                <PlusCircleOutlined />
              </a>
            </Dropdown>
          </div>
        ) : null}
      </div>
    );
  }
}

export default GraphConfigInner;
