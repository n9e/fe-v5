import React, { useEffect, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Modal } from 'antd';
import { getPromData } from './services';

interface MetricsExplorer {
  datasourceId?: number;
  show: boolean;
  updateShow(show: boolean): void;
  insertAtCursor(query: string): void;
}

const MetricsExplorer: React.FC<MetricsExplorer> = ({ datasourceId, show, updateShow, insertAtCursor }) => {
  const [metrics, setMetrics] = useState<string[]>([]);
  const [filteredMetrics, setFilteredMetrics] = useState<string[]>(metrics);

  function checkMetric(value: string) {
    insertAtCursor(value);
    updateShow(false);
  }

  useEffect(() => {
    if (show) {
      getPromData('/api/v1/label/__name__/values', {}, { 'X-Data-Source-Id': datasourceId }).then((res) => {
        setMetrics(res);
        setFilteredMetrics(res);
      });
    }
  }, [show]);

  return (
    <Modal className='prom-graph-metrics-explorer-modal' width={540} visible={show} title='Metrics Explorer' footer={null} onCancel={() => updateShow(false)} getContainer={false}>
      <Input
        prefix={<SearchOutlined />}
        onPressEnter={(e) => {
          e.preventDefault();
          const value = e.currentTarget.value;
          setFilteredMetrics(metrics.filter((metric) => metric.includes(value)));
        }}
      />
      <div className='prom-graph-metrics-explorer-list' onClick={(e) => checkMetric((e.target as HTMLElement).innerText)}>
        {filteredMetrics.map((metric) => (
          <div className='prom-graph-metrics-explorer-list-item' key={metric}>
            {metric}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default MetricsExplorer;
