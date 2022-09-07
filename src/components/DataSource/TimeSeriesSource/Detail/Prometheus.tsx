import React, { useState } from 'react';
import { Button, Row, Col } from 'antd';
import { DataSourceType } from '@/components/DataSource/TimeSeriesSource/types';

interface Props {
  data: DataSourceType;
}
export default function Index(props: Props) {
  const { data } = props;

  return (
    <div>
      <div className='page-title'>HTTP</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={24}>URL：</Col>
          <Col span={24} className='second-color'>
            {data.settings['prometheus.addr']}
          </Col>
        </Row>
      </div>
      <div className='page-title'>授权</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={12}>用户名：</Col>
          <Col span={12}>密码：</Col>
          <Col span={12} className='second-color'>
            {data.settings['prometheus.basic'] ? data.settings['prometheus.basic']['prometheus.user'] : '-'}
          </Col>
          <Col span={12} className='second-color'>
            {data.settings['prometheus.basic'] ? '******' : '-'}
          </Col>
        </Row>
      </div>
    </div>
  );
}
