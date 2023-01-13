import React from 'react';
import { Row, Col, Button } from 'antd';
import _ from 'lodash';
import PromQueryBuilderModal from '@/components/PromQueryBuilder/PromQueryBuilderModal';
import PromQLInput, { CMExpressionInputProps } from './index';

export function PromQLInputWithBuilder(props: CMExpressionInputProps & { cluster: string }) {
  return (
    <Row gutter={8}>
      <Col flex='auto'>
        <PromQLInput {..._.omit(props, 'cluster')} />
      </Col>
      <Col flex='74px'>
        <Button
          onClick={() => {
            PromQueryBuilderModal({
              // TODO: PromQL 默认是最近12小时，这块应该从使用组件的环境获取实际的时间范围
              range: {
                start: 'now-12h',
                end: 'now',
              },
              datasourceValue: props.cluster,
              value: props.value,
              onChange: (val) => {
                props.onChange && props.onChange(val);
              },
            });
          }}
        >
          新手模式
        </Button>
      </Col>
    </Row>
  );
}
