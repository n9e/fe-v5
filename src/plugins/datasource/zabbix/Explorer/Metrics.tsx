import React, { useState } from 'react';
import { Row, Col, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import GroupSelect from '../components/GroupSelect';
import HostSelect from '../components/HostSelect';
import AppSelect from '../components/AppSelect';
import ItemSelect from '../components/ItemSelect';
import FunctionsEditor from '../components/FunctionsEditor';
// import Options from '../components/Options';

interface IProps {
  datasourceCate: string;
  datasourceName: string;
  renderExecute: () => React.ReactNode;
}

export default function Metrics(props: IProps) {
  const { t } = useTranslation();
  const { datasourceCate, datasourceName, renderExecute } = props;
  const [selected, setSelected] = useState<{
    groupids: string[];
    hostids: string[];
    applicationids: string[];
  }>({
    groupids: [],
    hostids: [],
    applicationids: [],
  });
  const baseParams = {
    cate: datasourceCate,
    cluster: datasourceName,
  };

  return (
    <>
      <Row gutter={10}>
        <Col flex='auto'>
          <Row gutter={10}>
            <Col span={12}>
              <InputGroupWithFormItem label={t('主机群组')} labelWidth={84}>
                <Form.Item name={['query', 'group', 'filter']} rules={[{ required: true, message: t('请选择主机群组') }]}>
                  <GroupSelect
                    baseParams={baseParams}
                    onSelect={(val) => {
                      setSelected({
                        ...selected,
                        groupids: val,
                      });
                    }}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            <Col span={12}>
              <InputGroupWithFormItem label={t('主机')} labelWidth={84}>
                <Form.Item name={['query', 'host', 'filter']} rules={[{ required: true, message: t('请选择主机') }]}>
                  <HostSelect
                    baseParams={baseParams}
                    groupids={selected.groupids}
                    onSelect={(val) => {
                      setSelected({
                        ...selected,
                        hostids: val,
                      });
                    }}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
          </Row>
        </Col>
        <Col flex='430px'>{renderExecute()}</Col>
      </Row>
      <Row gutter={10}>
        <Col flex='auto'>
          <Row gutter={10}>
            <Col span={12}>
              <InputGroupWithFormItem label={t('应用集')} labelWidth={84}>
                <Form.Item name={['query', 'application', 'filter']}>
                  <AppSelect
                    baseParams={baseParams}
                    hostids={selected.hostids}
                    onSelect={(val) => {
                      setSelected({
                        ...selected,
                        applicationids: val,
                      });
                    }}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            <Col span={12}>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const group = getFieldValue(['query', 'group', 'filter']);
                  const host = getFieldValue(['query', 'host', 'filter']);
                  const application = getFieldValue(['query', 'application', 'filter']);
                  return (
                    <InputGroupWithFormItem label={t('监控项')} labelWidth={84}>
                      <Form.Item name={['query', 'item', 'filter']} rules={[{ required: true, message: t('请选择监控项') }]}>
                        <ItemSelect baseParams={baseParams} itemType='num' group={group} host={host} application={application} />
                      </Form.Item>
                    </InputGroupWithFormItem>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col flex='430px'></Col>
      </Row>
      <Form.Item name={['query', 'functions']}>
        <FunctionsEditor />
      </Form.Item>
      {/* <Options /> */}
    </>
  );
}
