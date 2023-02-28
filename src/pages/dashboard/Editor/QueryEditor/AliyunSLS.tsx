import React from 'react';
import { Form, Row, Col, Input, Button, Space, Switch, Radio, Tooltip } from 'antd';
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import Collapse, { Panel } from '../Components/Collapse';
import getFirstUnusedLetter from '../../Renderer/utils/getFirstUnusedLetter';
import ProjectSelect from '@/pages/metric/explorer/AliyunSLS/ProjectSelect';
import LogstoreSelect from '@/pages/metric/explorer/AliyunSLS/LogstoreSelect';
import Query from '@/pages/metric/explorer/AliyunSLS/Query';
import AdvancedSettings from '@/pages/metric/explorer/AliyunSLS/AdvancedSettings';
import { alphabet } from './config';
import { useTranslation } from "react-i18next";
export default function AliyunSLS({
  chartForm
}) {
  const {
    t
  } = useTranslation();
  return <Form.List name='targets'>
      {(fields, {
      add,
      remove
    }, {
      errors
    }) => {
      const {
        t
      } = useTranslation();
      return <>
            <Collapse>
              {_.map(fields, (field, index) => {
            const prefixName = ['targets', field.name];
            return <Panel header={<Form.Item noStyle shouldUpdate>
                        {({
                getFieldValue
              }) => {
                return getFieldValue([...prefixName, 'refId']) || alphabet[index];
              }}
                      </Form.Item>} key={field.key} extra={<div>
                        {fields.length > 1 ? <DeleteOutlined style={{
                marginLeft: 10
              }} onClick={() => {
                remove(field.name);
              }} /> : null}
                      </div>}>
                    <Form.Item noStyle {...field} name={[field.name, 'refId']} hidden />
                    <Form.Item shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues.datasourceName, curValues.datasourceName) || !_.isEqual(prevValues?.targets?.[field.name]?.query.project, curValues?.targets?.[field.name]?.query.project)} noStyle>
                      {({
                  getFieldValue
                }) => {
                  const datasourceCate = getFieldValue('datasourceCate');
                  const datasourceName = getFieldValue('datasourceName');
                  const project = getFieldValue(['targets', field.name, 'query', 'project']);
                  return <Row gutter={10}>
                            <Col span={12}>
                              <ProjectSelect datasourceCate={datasourceCate} datasourceName={datasourceName} prefixName={[field.name, 'query']} width='100%' layout='vertical' />
                            </Col>
                            <Col span={12}>
                              <LogstoreSelect datasourceCate={datasourceCate} datasourceName={datasourceName} project={project} prefixName={[field.name, 'query']} width='100%' layout='vertical' />
                            </Col>
                          </Row>;
                }}
                    </Form.Item>
                    <Row gutter={10}>
                      <Col flex='auto'>
                        <Query prefixName={[field.name, 'query']} width='100%' layout='vertical' />
                      </Col>
                      <Col flex='215px'>
                        <Space>
                          <Form.Item label={t("SQL增强")} name={[field.name, 'query', 'power_sql']} valuePropName='checked'>
                            <Switch />
                          </Form.Item>
                          <Form.Item label=' ' name={[field.name, 'query', 'mode']} initialValue='timeSeries'>
                            <Radio.Group buttonStyle='solid'>
                              <Radio.Button value='timeSeries'>{t("时序值")}</Radio.Button>
                              <Radio.Button value='raw'>{t("日志原文")}</Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                        </Space>
                      </Col>
                    </Row>
                    <Form.Item shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues?.targets?.[field.name]?.query.mode, curValues?.targets?.[field.name]?.query.mode)} noStyle>
                      {({
                  getFieldValue
                }) => {
                  const mode = getFieldValue(['targets', field.name, 'query', 'mode']);

                  if (mode === 'timeSeries') {
                    return <AdvancedSettings span={12} prefixName={[field.name]} />;
                  }
                }}
                    </Form.Item>
                  </Panel>;
          })}
              <Form.ErrorList errors={errors} />
            </Collapse>
            <Button style={{
          width: '100%',
          marginTop: 10
        }} onClick={() => {
          add({
            query: {
              values: [{
                func: 'count'
              }],
              date_field: '@timestamp',
              interval: 1,
              interval_unit: 'min'
            },
            refId: getFirstUnusedLetter(_.map(chartForm.getFieldValue('targets'), 'refId'))
          });
        }}>
              + add query
            </Button>
          </>;
    }}
    </Form.List>;
}