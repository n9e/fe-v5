import React from 'react';
import { Input, Form, InputNumber, Row, Col } from 'antd';
import { IFromItemBaseProps } from '../../types';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';

const FormItem = Form.Item;

export default function HTTPList({ namePrefix, type }: IFromItemBaseProps) {
  const timeoutShow = ['prometheus'];
  const textObj = {
    prometheus: {
      addrPlaceholder: 'http://localhost:9090',
      addrLabel: 'URL',
    },
    zabbix: {
      addrPlaceholder: 'http://127.0.0.1:10051/api_jsonrpc.php',
      addrLabel: 'URL(支持4.4及以上版本)',
    },
    es: {
      addrPlaceholder: 'http://localhost:9200',
      addrLabel: 'URL',
    },
  };
  return (
    <div>
      <Form.List name={[...namePrefix, `${type}.nodes`]} initialValue={['']}>
        {(fields, { add, remove }, { errors }) => (
          <>
            <div className='page-title' style={{ marginTop: '8px' }}>
              HTTP
              <PlusCircleOutlined style={{ marginLeft: '16px', cursor: 'pointer', fontSize: '14px' }} onClick={() => add()} />
            </div>
            {fields.map((field, index) => {
              return (
                <FormItem
                  key={field.key}
                  label={
                    index === 0 ? (
                      <>
                        <span>URL</span>
                      </>
                    ) : null
                  }
                >
                  <Row gutter={16} align='middle'>
                    <Col flex={1}>
                      <FormItem name={[field.name]} rules={[{ required: true, message: '请输入URL' }]} noStyle>
                        <Input placeholder={textObj[type].addrPlaceholder} />
                      </FormItem>
                    </Col>
                    {fields.length > 1 ? (
                      <Col>
                        <MinusCircleOutlined style={{ cursor: 'pointer', fontSize: '14px', margin: '8px 16px 0 0' }} onClick={() => remove(field.name)} />
                      </Col>
                    ) : null}
                  </Row>
                </FormItem>
              );
            })}
          </>
        )}
      </Form.List>

      <FormItem label='超时(单位:ms)' name={[...namePrefix, `${type}.timeout`]} rules={[{ type: 'number', min: 0 }]}>
        <InputNumber placeholder='请输入超时时间' style={{ width: '100%' }} controls={false} />
      </FormItem>
    </div>
  );
}
