/* eslint-disable react/sort-comp */
/* eslint-disable prefer-template */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Select } from 'antd';
import Comparison from './Comparison';
import * as config from '../config';
import { fetchAggrGroups } from '../api';

const { Option } = Select;

/**
 * graph 内置配置条组件
 */

class GraphConfigInner extends Component {
  static propTypes = {
    data: PropTypes.shape(config.graphPropTypes).isRequired,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
  };

  constructor(props) {
    super(props);
    console.log('GraphConfigInner', props.data)
    this.state = {
      curAggrFunc: 'avg',
      curAggrGroups: ['ident'],
      curComparisonValue: {},
      aggrGroups: [],
      timeRange: []
    }
  }

  componentDidMount () {
    this.fetchAggrGroups()
  }

  componentDidUpdate (prevProps) {
    const oldHosts = (prevProps.data.selectedHosts || []).map(h => h.ident)
    const newHosts = (this.props.data.selectedHosts || []).map(h => h.ident)
    const isHostsChanged = !_.isEqual(oldHosts, newHosts)
    if (isHostsChanged) {
      this.fetchAggrGroups()
    }
  }

  fetchAggrGroups () {
    const { metric, selectedHosts } = this.props.data
    const idents = selectedHosts.map(host => host.ident)
    fetchAggrGroups({
      start: Math.round(Number(this.props.data.start) / 1000),
      end: Math.round(Number(this.props.data.end) / 1000),
      match: [
        `${metric}{ident=~"${idents.join('|')}"}`
      ]
    }).then(res => {
      console.log('res', res)
      this.setState({
        aggrGroups: res.data
      })
    })
  }

  handleAggrFuncChange = (val) => {
    const { data, onChange } = this.props;
    this.setState({
      curAggrFunc: val
    })
    onChange('update', data.id, {
      comparison: this.state.curComparisonValue.comparison,
      relativeTimeComparison: this.state.curComparisonValue.relativeTimeComparison,
      comparisonOptions: this.state.curComparisonValue.comparisonOptions,
      aggrFunc: val,
      aggrGroups: this.state.curAggrGroups
    });
  }

  handleComparisonChange = (values) => {
    const { data, onChange } = this.props;
    this.setState({
      curComparisonValue: values
    })
    onChange('update', data.id, {
      comparison: values.comparison,
      relativeTimeComparison: values.relativeTimeComparison,
      comparisonOptions: values.comparisonOptions,
      aggrFunc: this.state.curAggrFunc,
      aggrGroups: this.state.curAggrGroups
    });
  }

  handleAggrGroupsChange = (values) => {
    const { data, onChange } = this.props;
    this.setState({
      curAggrGroups: values
    })
    onChange('update', data.id, {
      comparison: this.state.curComparisonValue.comparison,
      relativeTimeComparison: this.state.curComparisonValue.relativeTimeComparison,
      comparisonOptions: this.state.curComparisonValue.comparisonOptions,
      aggrFunc: this.state.curAggrFunc,
      aggrGroups: values,
    });
  }

  render() {
    const { data, onChange } = this.props;
    const { now, start, end, comparison } = data;

    return (
      <div className="graph-config-inner">
        <div className="graph-config-inner-item">
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
        <div className="graph-config-inner-item">
          聚合函数
          ：
          <Select
            allowClear
            size="small"
            style={{ width: 80 }}
            value={this.state.curAggrFunc}
            onChange={this.handleAggrFuncChange}
          >
            <Option value="sum">sum</Option>
            <Option value="avg">avg</Option>
            <Option value="max">max</Option>
            <Option value="min">min</Option>
          </Select>
        </div>
        {
          this.state.curAggrFunc ?
            <div className="graph-config-inner-item">
              <span>
                聚合维度
                ：
              </span>
              <Select
                mode="multiple"
                size="small"
                style={{ minWidth: 60 }}
                dropdownMatchSelectWidth={false}
                value={this.state.curAggrGroups}
                onChange={this.handleAggrGroupsChange}
              >
                {this.state.aggrGroups.map(ag => <Option key={ag} value={ag}>{ag}</Option>)}
              </Select>
            </div> : null
        }
      </div>
    );
  }
}

export default GraphConfigInner;
