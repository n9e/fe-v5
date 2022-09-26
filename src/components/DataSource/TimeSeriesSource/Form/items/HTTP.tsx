import React from 'react';
import { Input, Form, InputNumber } from 'antd';
import { IFromItemBaseProps } from '../../types';

const FormItem = Form.Item;

export default function HTTP({ namePrefix, type }: IFromItemBaseProps) {
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
      <div className='page-title'>HTTP</div>
      <FormItem
        label={textObj[type].addrLabel}
        name={[...namePrefix, `${type}.addr`]}
        rules={[{ required: true }]}
        style={{ marginBottom: timeoutShow.includes(type) ? '0' : '18px' }}
      >
        <Input placeholder={textObj[type].addrPlaceholder} />
      </FormItem>
      {timeoutShow.includes(type) && (
        <>
          <div className='second-color' style={{ paddingLeft: '12px', margin: '0 0 18px' }}>
            <div>常见时序数据库配置示例（兼容 Prometheus 查询 API）：</div>
            <div>{'1. Prometheus:  http://localhost:9090/'}</div>
            <div>{'2. Thanos:  http://localhost:19192/'}</div>
            <div>{'3. VictoriaMetrics:  http://{vmselect}:8481/select/0/prometheus/'}</div>
            <div>{'4. M3:  http://localhost:7201/'}</div>
            <div>{'5. SLS:  https://{project}.{sls-enpoint}/prometheus/{project}/{metricstore}/'}</div>
          </div>
        </>
      )}
      <FormItem label='超时(单位:ms)' name={[...namePrefix, `${type}.timeout`]} rules={[{ type: 'number', min: 0 }]}>
        <InputNumber placeholder='请输入超时时间' style={{ width: '100%' }} controls={false} />
      </FormItem>
    </div>
  );
}
