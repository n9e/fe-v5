import React from 'react';
import { Form, Button, Space, Radio } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Collapse, { Panel } from '../../../components/Collapse';
import getFirstUnusedLetter from '../../../utils/getFirstUnusedLetter';
import { alphabet } from '../../../config';
import { defaultTargetQueryValue } from '../const';
import Metrics from './Metrics';
import ItemIDs from './ItemIDs';
import Text from './Text';

export { defaultTargetQueryValue };

export default function QueryBuilder({ chartForm }) {
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
                          !_.isEqual(prevValues?.targets?.[field.name]?.query?.mode, curValues?.targets?.[field.name]?.query?.mode) ||
                          !_.isEqual(prevValues?.targets?.[field.name]?.query?.subMode, curValues?.targets?.[field.name]?.query?.subMode)
                        );
                      }}
                      noStyle
                    >
                      {({ getFieldValue }) => {
                        const datasourceCate = getFieldValue('datasourceCate');
                        const datasourceName = getFieldValue('datasourceName');
                        const mode = getFieldValue([...prefixName, 'query', 'mode']);
                        const subMode = getFieldValue([...prefixName, 'query', 'subMode']);
                        return (
                          <>
                            <Space>
                              <Form.Item {...field} name={[field.name, 'query', 'mode']}>
                                <Radio.Group buttonStyle='solid'>
                                  <Radio.Button value='timeseries'>{t('时序值')}</Radio.Button>
                                  <Radio.Button value='text'>{t('文本值')}</Radio.Button>
                                </Radio.Group>
                              </Form.Item>
                              {mode === 'timeseries' && (
                                <Form.Item {...field} name={[field.name, 'query', 'subMode']}>
                                  <Radio.Group buttonStyle='solid'>
                                    <Radio.Button value='metrics'>{t('条件查询')}</Radio.Button>
                                    <Radio.Button value='itemIDs'>{t('ID 查询')}</Radio.Button>
                                  </Radio.Group>
                                </Form.Item>
                              )}
                            </Space>
                            {mode === 'timeseries' && subMode === 'metrics' && <Metrics prefixField={field} datasourceCate={datasourceCate} datasourceName={datasourceName} />}
                            {mode === 'timeseries' && subMode === 'itemIDs' && <ItemIDs prefixField={field} />}
                            {mode === 'text' && <Text prefixField={field} datasourceCate={datasourceCate} datasourceName={datasourceName} />}
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
                  query: defaultTargetQueryValue,
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
