import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Col,
  Row
} from 'antd';
const { Option } = Select;
const { TextArea } = Input;
import {
  MinusCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface Itag {
  field: any;
  remove: Function;
  add: Function;
  fields: any[];

  form: any;
}

const TagItem: React.FC<Itag> = ({
  field,
  remove,
}) => {
  const { t } = useTranslation();
  const [valuePlaceholder, setValuePlaceholder] = useState<string>('');
  const [funcCur, setfuncCur] = useState('==');

  const funcChange = (val) => {
    let text = '';
    if (val === 'in') {
      text = '可以输入多个值，用回车分割';
    } else if (val === '=~') {
      text = '请输入正则表达式匹配标签value';
    }
    setfuncCur(val);
    setValuePlaceholder(text);
  }
  return (
    <>
      <Row gutter={[10, 10]} style={{marginBottom: '10px'}}>
        <Col span={5}>
          <Form.Item
            style={{marginBottom: 0}}
            name={[field.name, 'key']}
            fieldKey={[field.name, 'key']}
            rules={[{ required: true, message: t('key不能为空') }]}
          >
            <Input placeholder={t('请输入屏蔽事件标签key')} />
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item
            style={{marginBottom: 0}}
            name={[field.name, 'func']}
            fieldKey={[field.name, 'func']}
            initialValue='=='
          >
            <Select onChange={funcChange}>
              <Option value='=='>==</Option>
              <Option value='=~'>=~</Option>
              <Option value='in'>in</Option>
            </Select>
          </Form.Item>

        </Col>
        <Col span={15}>
          <Form.Item
            style={{marginBottom: 0}}
            name={[field.name, 'value']}
            fieldKey={[field.name, 'value']}
            rules={[{ required: true, message: t('value不能为空') }]}
          >
            {funcCur == 'in' ? (
              <Select mode="tags" open={false} style={{ width: '100%' }} placeholder={t(valuePlaceholder)}>
    
              </Select>
            ) : (
              <TextArea className='ant-input' rows={1} placeholder={t(valuePlaceholder)}/>
            )}
          </Form.Item>
        </Col>
        <Col>
          <MinusCircleOutlined style={{marginTop: '8px'}} onClick={() => remove(field.name)} />
        </Col>
      </Row>
    </>
  );
};

export default TagItem;
