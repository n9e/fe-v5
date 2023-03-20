import React from 'react';
import { Form, Row, Col, Button, Space, Tooltip, Input } from 'antd';
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Collapse, { Panel } from '../../../components/Collapse';
import getFirstUnusedLetter from '../../../utils/getFirstUnusedLetter';
import { alphabet } from '../../../config';
import DBNameSelect from '../components/DBNameSelect';
import AdvancedSettings from '../components/AdvancedSettings';

export default function AliyunSLS({ chartForm }) {
  const { t } = useTranslation();
  return (
    <Form.List name='targets'>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <Collapse>
              {_.map(fields, (field, index) => {
                const prefixName = ['targets', field.name];
                return (
                  <Panel
                    header={
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          return getFieldValue([...prefixName, 'refId']) || alphabet[index];
                        }}
                      </Form.Item>
                    }
                    key={field.key}
                    extra={
                      <div>
                        {fields.length > 1 ? (
                          <DeleteOutlined
                            style={{
                              marginLeft: 10,
                            }}
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        ) : null}
                      </div>
                    }
                  >
                    <Form.Item noStyle {...field} name={[field.name, 'refId']} hidden>
                      <div />
                    </Form.Item>
                    <Form.Item
                      shouldUpdate={(prevValues, curValues) => {
                        return (
                          !_.isEqual(prevValues.datasourceName, curValues.datasourceName) ||
                          !_.isEqual(prevValues?.targets?.[field.name]?.query?.dbname, curValues?.targets?.[field.name]?.query?.dbname)
                        );
                      }}
                      noStyle
                    >
                      {({ getFieldValue }) => {
                        const datasourceCate = getFieldValue('datasourceCate');
                        const datasourceName = getFieldValue('datasourceName');
                        const dbname = getFieldValue(['targets', field.name, 'query', 'dbname']);
                        return (
                          <>
                            <Row gutter={8}>
                              <Col flex='240px'>
                                <Form.Item
                                  label={t('数据库')}
                                  {...field}
                                  name={[field.name, 'query', 'dbname']}
                                  rules={[
                                    {
                                      required: true,
                                      message: t('请选择数据库'),
                                    },
                                  ]}
                                >
                                  <DBNameSelect datasourceCate={datasourceCate} datasourceName={datasourceName} />
                                </Form.Item>
                              </Col>
                              <Col flex='auto'>
                                <Form.Item
                                  label={
                                    <Space>
                                      <span>{t('查询条件')}</span>
                                      <Tooltip title={''}>
                                        <QuestionCircleOutlined />
                                      </Tooltip>
                                    </Space>
                                  }
                                  {...field}
                                  name={[field.name, 'query', 'command']}
                                  rules={[
                                    {
                                      required: true,
                                      message: t('请输入查询条件'),
                                    },
                                  ]}
                                >
                                  <Input style={{ width: '100%' }} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <AdvancedSettings datasourceCate={datasourceCate} datasourceName={datasourceName} dbname={dbname} />
                          </>
                        );
                      }}
                    </Form.Item>
                  </Panel>
                );
              })}
              <Form.ErrorList errors={errors} />
            </Collapse>
            <Button
              style={{
                width: '100%',
                marginTop: 10,
              }}
              onClick={() => {
                add({
                  query: {
                    command: '',
                  },
                  refId: getFirstUnusedLetter(_.map(chartForm.getFieldValue('targets'), 'refId')),
                });
              }}
            >
              + add query
            </Button>
          </>
        );
      }}
    </Form.List>
  );
}
