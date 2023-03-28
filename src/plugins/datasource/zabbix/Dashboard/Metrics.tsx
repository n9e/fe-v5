import React, { useState } from 'react';
import { Row, Col, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import GroupSelect from '../components/GroupSelect';
import HostSelect from '../components/HostSelect';
import AppSelect from '../components/AppSelect';
import ItemSelect from '../components/ItemSelect';
import FunctionsEditor from '../components/FunctionsEditor';

interface IProps {
  datasourceCate: string;
  datasourceName: string;
  prefixField: any;
}

export default function Metrics(props: IProps) {
  const { t } = useTranslation();
  const { datasourceCate, datasourceName, prefixField = {} } = props;
  const prefixName = [prefixField.name, 'query'];
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
        <Col span={12}>
          <Form.Item {...prefixField} label={t('主机群组')} name={[...prefixName, 'group', 'filter']} rules={[{ required: true, message: t('请选择主机群组') }]}>
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
        </Col>
        <Col span={12}>
          <Form.Item {...prefixField} label={t('主机')} name={[...prefixName, 'host', 'filter']} rules={[{ required: true, message: t('请选择主机') }]}>
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
        </Col>
      </Row>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item {...prefixField} label={t('应用集')} name={[...prefixName, 'application', 'filter']}>
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
        </Col>
        <Col span={12}>
          <Form.Item {...prefixField} label={t('监控项')} name={[...prefixName, 'item', 'filter']} rules={[{ required: true, message: t('请选择监控项') }]}>
            <ItemSelect baseParams={baseParams} hostids={selected.hostids} applicationids={selected.applicationids} itemType='num' />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item {...prefixField} name={[...prefixName, 'functions']}>
        <FunctionsEditor />
      </Form.Item>
    </>
  );
}
