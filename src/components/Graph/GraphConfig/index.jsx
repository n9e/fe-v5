import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, message } from 'antd';
import _ from 'lodash';
import GraphConfigForm from './GraphConfigForm';
import ChartTypeForm from './ChartTypeForm';
import './style.less';

/**
 * graph 配置面板组件
 */

export default class GraphConfig extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      key: _.uniqueId('graphConfigModal_'),
      visible: false,
      type: 'add',
      btnName: '看图',
      btnDisabled: false,
      data: {}, // graphConfig
      isScreen: false,
      subclassOptions: [],
    };
  }

  showModal(
    type = this.state.type,
    btnName = this.state.btnName,
    data = {},
  ) {
    const { isScreen, subclassOptions } = data;
    delete data.isScreen;
    delete data.subclassOptions;

    this.setState({
      key: _.uniqueId('graphConfigModal_'),
      visible: true,
      type,
      btnName,
      data,
      isScreen,
      subclassOptions,
    });
  }

  handleSubmit(type, id) {
    const { onChange } = this.props;
    const { data } = this.state;
    const formState = this.graphConfigForm.state.graphConfig;
    const { start, end } = formState;

    if (Number(start) > Number(end)) {
      message.error('开始时间不能大于结束时间!');
      return;
    }

    if (
      _.get(formState, 'chartTypeOptions.chartType') === 'singleValue'
      && !_.get(formState, 'metrics.[0].aggrFunc')
    ) {
      message.error('数值图表必须选择聚合方式!');
      return;
    }

    /**
     * TODO: 待重构图表配置
     * 指标配置从 ref state.graphConfig 里拿
     * 图表类型配置从 state.data.chartTypeOptions 里拿
     */
    this.setState({
      visible: false,
    }, () => {
      onChange(type, {
        ...formState,
        chartTypeOptions: data.chartTypeOptions,
      }, id);
    });
  }

  renderFooter() {
    const { type, data, btnName, btnDisabled } = this.state;

    if (type === 'push' || type === 'unshift') {
      return (
        <Button
          type="primary"
          disabled={btnDisabled}
          onClick={() => {
            this.handleSubmit(type);
          }}
        >
          {btnName}
        </Button>
      );
    }
    if (type === 'update') {
      return (
        <Button
          key="submit"
          type="primary"
          disabled={btnDisabled}
          onClick={() => {
            this.handleSubmit(type, data.id);
          }}
        >
          {btnName}
        </Button>
      );
    }
    return null;
  }

  render() {
    const { key, visible, data, isScreen, subclassOptions } = this.state;

    return (
      <Modal
        key={key}
        width={750}
        title={"graph.config.title"}
        destroyOnClose
        visible={visible}
        maskClosable={false}
        wrapClassName="ant-modal-GraphConfig"
        footer={this.renderFooter()}
        onCancel={() => {
          this.setState({ visible: false });
        }}
      >
        <div className="graph-config-form-container">
          <GraphConfigForm
            ref={(ref) => { this.graphConfigForm = ref; }}
            data={data}
            isScreen={isScreen}
            subclassOptions={subclassOptions}
            btnDisable={(disabled) => {
              this.setState({
                btnDisabled: disabled,
              });
            }}
          />
          <ChartTypeForm
            data={data.chartTypeOptions}
            onChange={(newOpts) => {
              this.setState({
                data: {
                  ...data,
                  chartTypeOptions: newOpts,
                },
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}
