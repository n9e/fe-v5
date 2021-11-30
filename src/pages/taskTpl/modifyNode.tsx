import React, { Component } from 'react';
import { Modal, Form, TreeSelect, message } from 'antd';
import _ from 'lodash';
import ModalControl from '@pkgs/ModalControl';
import request from '@pkgs/request';
import pkgsApi from '@pkgs/api';
import api from '@common/api';
import { normalizeTreeData, renderTreeNodes } from '@pkgs/Layout/utils';

const FormItem = Form.Item;

class ModifyNode extends Component<any> {
  static defaultProps = {
    visible: true,
    onOk: _.noop,
    destroy: _.noop,
  };

  state = {
    treeData: [],
  };

  componentDidMount() {
    this.fetchTreeData();
  }

  fetchTreeData() {
    request(pkgsApi.tree).then((res) => {
      const treeData = normalizeTreeData(res);
      this.setState({ treeData });
    });
  }

  handleOk = () => {
    const { selectedIds } = this.props;
    this.props.form.validateFields((err: any, values: any) => {
      if (!err) {
        request(`${api.tasktpls}/node`, {
          method: 'PUT',
          body: JSON.stringify({
            node_id: values.node_id,
            ids: selectedIds,
          }),
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'tpl.tag.bind.success' }));
          this.props.onOk();
          this.props.destroy();
        });
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { visible } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={this.props.intl.formatMessage({ id: 'tpl.node.modify.title' })}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label={this.props.intl.formatMessage({ id: 'tpl.node.modify' })} required>
            {getFieldDecorator('node_id', {
              rules: [{ required: true , message: '请选择节点！'}],
            })(
              <TreeSelect
                showSearch
                allowClear
                treeNodeFilterProp="path"
                treeNodeLabelProp="path"
                dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
              >
                {renderTreeNodes(this.state.treeData, 'treeSelect')}
              </TreeSelect>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default ModalControl(Form.create()(injectIntl(ModifyNode)));
