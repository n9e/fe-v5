import React from 'react';
import { Row, Col } from 'antd';
import { DataSourceType } from '../../TimeSeriesSource/types';
import _ from 'lodash';

interface Props {
  data: DataSourceType;
}
export default function Index(props: Props) {
  const { data } = props;

  return (
    <div>
      <div className='page-title'>服务入口</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={24}>{'访问域名（私网域名/公网域名/跨域域名):'}</Col>
          <Col span={24} className='second-color'>
            {data.settings['sls.endpoint']}
          </Col>
        </Row>
      </div>
      <div className='page-title'>授权</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={12}>AccessKey ID：</Col>
          <Col span={12}>AccessKey Secret：</Col>
          <Col span={12} className='second-color'>
            {data.settings['sls.access_key_id'] ? data.settings['sls.access_key_id'] : '-'}
          </Col>
          <Col span={12} className='second-color'>
            {data.settings['sls.access_key_secret'] ? data.settings['sls.access_key_secret'] : '-'}
          </Col>
        </Row>
      </div>
    </div>
  );
}
