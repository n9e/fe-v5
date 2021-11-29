import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { Form, Input, InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import request from '@/utils/request';
import api from '@/utils/api';
import Editor from './editor';
import './style.less';

const FormItem = Form.Item;
const { TextArea } = Input;

const TplForm = (props) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [habitsId, setHabitsId] = useState('ident');

  useEffect(() => {
    // 获取服务列表
  });

  const handleSubmit = (values) => {
    props.onSubmit({
      ...values,
      tags: _.join(values.tags, ','),
      hosts: _.split(values.hosts, '\n'),
    });
  }

  const { initialValues, type } = props;
  // const { getFieldDecorator } = form;
  const search = _.get(props, 'location.search');
  const query = queryString.parse(search);

  // if (type === 'tpl') {
  //   getFieldDecorator('nid', {
  //     initialValue: initialValues.nid || query.nid,
  //   });
  // }

  return (
    <div className="job-tpl-form">
      <Form onFinish={handleSubmit} layout="vertical">
        <FormItem
          label={
            <>
              <strong>Title:</strong>
              { type === 'tpl' ? t('tpl.title.tpl.help') : t('tpl.title.task.help') }
            </>
          }
          name="title"
          initialValue={initialValues.title}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <Input />
        </FormItem>
        {
          type === 'tpl' ?
            <FormItem
              label={
                <>
                  <strong>Tags:</strong>
                  {t('tpl.tags.help')}
                </>
              }
              name="tags"
              initialValue={initialValues.tags ? _.split(initialValues.tags, ',') : []}
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
              />
            </FormItem> : null
        }
        <FormItem
          label={
            <>
              <strong>Account:</strong>
              {t('tpl.account.help')}
            </>
          }
          name="account"
          initialValue={initialValues.account}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <Input />
        </FormItem>
        <FormItem
          label={
            <>
              <strong>Batch:</strong>
              {t('tpl.batch.help')}
            </>
          }
          name="batch"
          initialValue={initialValues.batch}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <InputNumber min={0} />
        </FormItem>
        <FormItem
          label={
            <>
              <strong>Tolerance:</strong>
              {t('tpl.tolerance.help')}
            </>
          }
          name="tolerance"
          initialValue={initialValues.tolerance}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <InputNumber min={0} />
        </FormItem>
        <FormItem
          label={
            <>
              <strong>Timeout:</strong>
              {t('tpl.timeout.help')}
            </>
          }
          name="timeout"
          initialValue={initialValues.timeout}
        >
          <InputNumber min={0} />
        </FormItem>
        <FormItem
          label={
            <span>
              <strong>Pause:</strong>
              {t('tpl.pause.help', { habitsId })}
            </span>
          }
          name="pause"
          initialValue={initialValues.pause}
        >
          <Input />
        </FormItem>
        {
          type !== 'tpl' ?
            <>
              <FormItem
                label={
                  <span>
                    <strong>节点:</strong>
                  </span>
                }
              >
                {/* <TreeSelect
                  showSearch
                  allowClear
                  treeNodeFilterProp="path"
                  treeNodeLabelProp="path"
                  dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
                  onChange={(value: number) => {
                    request(`${api.node}/${value}/resources?limit=1000`).then((res) => {
                      setFieldsValue({
                        hosts: _.join(_.map(res.list, 'ident'), '\n'),
                      });
                    });
                  }}
                >
                  {renderTreeNodes(this.state.treeData, 'treeSelect')}
                </TreeSelect> */}
              </FormItem>
            </> : null
        }
        <FormItem
          label={
            <>
              <strong>Host {habitsId}:</strong>
              {t('tpl.host.help')}
            </>
          }
          name="hosts"
          initialValue={_.join(initialValues.hosts, '\n')}
          rules={[{ required: type !== 'tpl' , message: '必填项！'}]}
        >
          <TextArea autoSize={{ minRows: 3, maxRows: 8 }} />,
        </FormItem>
        <FormItem
          label={
            <>
              <strong>Script:</strong>
              {t('tpl.script.help')}
            </>
          }
          name="script"
          initialValue={initialValues.script}
          rules={[{ required: true, message: '必填项！' }]}
        >
          <Editor />
        </FormItem>
        <FormItem
          label={
            <span>
              <strong>Args:</strong>
              {t('tpl.args.help')}
            </span>
          }
          name="args"
          initialValue={initialValues.args}
        >
          <Input />
        </FormItem>
        <FormItem>
          {props.footer}
        </FormItem>
      </Form>
    </div>
  );
}

TplForm.defaultProps = {
  type: 'tpl', // tpl || task
  initialValues: {
    title: '',
    batch: 0,
    tolerance: 0,
    timeout: 30,
    pause: '',
    script: '#!/bin/bash\n# e.g.\nexport PATH=/usr/local/bin:/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/sbin:~/bin\nss -tln',
    args: '',
    tags: '',
    account: 'root',
    hosts: [],
    treeData: [],
  },
  onSubmit: () => {},
};

export default withRouter(TplForm);
