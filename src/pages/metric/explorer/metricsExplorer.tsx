/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { SearchOutlined } from '@ant-design/icons';
import { Input, Modal } from 'antd';
import React, { useEffect, useState } from 'react';

interface MetricsExplorer {
  show: boolean;
  updateShow(show: boolean): void;
  metrics: string[];
  insertAtCursor(query: string): void;
}

const MetricsExplorer: React.FC<MetricsExplorer> = ({ show, updateShow, metrics, insertAtCursor }) => {
  const [filteredMetrics, setFilteredMetrics] = useState<string[]>(metrics);

  function checkMetric(value: string) {
    insertAtCursor(value);
    updateShow(false);
  }

  useEffect(() => {
    setFilteredMetrics(metrics);
  }, [metrics]);

  return (
    <Modal className='metrics-explorer-modal' width={540} visible={show} title='Metrics Explorer' footer={null} onCancel={() => updateShow(false)}>
      <Input
        className='left-area-group-search'
        prefix={<SearchOutlined />}
        onPressEnter={(e) => {
          e.preventDefault();
          const value = e.currentTarget.value;
          setFilteredMetrics(metrics.filter((metric) => metric.includes(value)));
        }}
      />
      <div className='metric-list' onClick={(e) => checkMetric((e.target as HTMLElement).innerText)}>
        {filteredMetrics.map((metric) => (
          <div className='metric-list-item' key={metric}>
            {metric}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default MetricsExplorer;
