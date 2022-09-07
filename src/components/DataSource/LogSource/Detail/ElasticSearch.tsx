import React, { Fragment, useState } from 'react';
import { Button, Row, Col } from 'antd';
import { DataSourceType } from '../../TimeSeriesSource/types';
import _ from 'lodash';

interface Props {
  data: DataSourceType;
}
export default function Index(props: Props) {
  const { data } = props;

  const renderaa = () => {
    console.log('data', data.settings['es.basic']);
    return data.settings['es.basic'] ? '******' : '-';
  };

  return (
    <div>
      <div className='page-title'>HTTP</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          {data.settings['es.nodes'].map((el, index) => (
            <Fragment key={index}>
              <Col span={4}>URL：</Col>
              <Col span={20} className='second-color'>
                {el}
              </Col>
            </Fragment>
          ))}
        </Row>
      </div>
      <div className='page-title'>授权</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={8}>用户名：</Col>
          <Col span={8}>密码：</Col>
          <Col span={8}>跳过TLS检查: </Col>
          <Col span={8} className='second-color'>
            {data.settings['es.basic']?.['es.user'] ? data.settings['es.basic']['es.user'] : '-'}
          </Col>
          <Col span={8} className='second-color'>
            {data.settings['es.basic']?.['es.password'] ? '******' : '-'}
          </Col>
          <Col span={8} className='second-color'>
            {data.settings?.['es.tls']?.['es.tls.skip_tls_verify'] ? '是' : '否'}
          </Col>
        </Row>
      </div>
      {!_.isEmpty(data.settings['es.headers']) && (
        <>
          <div className='page-title'>自定义HTTP标头</div>
          <div className='flash-cat-block'>
            <Row gutter={16}>
              {Object.keys(data.settings['es.headers']).map((el) => {
                return (
                  <Col key={el} span={24}>
                    {el + ' : ' + data.settings['es.headers'][el]}
                  </Col>
                );
              })}
            </Row>
          </div>
        </>
      )}
      <div className='page-title'>ES详情</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={8}>版本：</Col>
          <Col span={8}>最小并发分片请求数：</Col>
          <Col span={8}>最小时间间隔(s): </Col>
          <Col span={8} className='second-color'>
            {data.settings['es.version'] || '-'}
          </Col>
          <Col span={8} className='second-color'>
            {data.settings['es.max_shard'] || '-'}
          </Col>
          <Col span={8} className='second-color'>
            {data.settings['es.min_interval'] || '-'}
          </Col>
          <Col span={24} className='mt8'>
            写配置:
          </Col>
          <Col span={24} className='second-color'>
            {data.settings['es.enable_write'] ? '允许写入' : '不允许写入'}
          </Col>
        </Row>
      </div>
    </div>
  );
}
