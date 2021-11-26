import PageLayout from '@/components/pageLayout';
import { CloseCircleOutlined, LineChartOutlined, PlusOutlined, SearchOutlined, SettingFilled } from '@ant-design/icons';
import { Button, Input, Modal, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';
import { generateID } from '@/utils';
import { getMetrics } from '@/services/warning';
import { panelDefaultOptions, PanelOptions } from './panel';
import Panel from './panel';

// type PanelMeta = { id: string; options: PanelOptions };
type PanelMeta = { id: string; };

interface PanelListProps {
  metrics: string[];
}

const PanelList: React.FC<PanelListProps> = ({ metrics }) => {
  const [panelList, setPanelList] = useState<PanelMeta[]>([{ id: generateID() }]);
  // 添加一个查询面板
  function addPanel() {
    setPanelList((a) => [
      ...panelList,
      {
        id: generateID(),
        // options: {...panelDefaultOptions},
      },
    ]);
  }

  // 删除指定查询面板
  function removePanel(id) {
    setPanelList(panelList.reduce<PanelMeta[]>((acc, panel) => (panel.id !== id ? [...acc, { ...panel }] : acc), []));
  }

  // 内容变更
  // function onOptionsChanged (id, opts) {
  //   setPanelList(panelList.map((p) => (id === p.id ? { ...p, options: opts } : p)));
  // }

  return (
    <>
      {panelList.map(({ id }) => 
        <Panel
          key={id}
          // options={options}
          // onOptionsChanged={(opts) => onOptionsChanged(id, opts)}
          metrics={metrics}
          removePanel={() => removePanel(id)}
        />
      )}
      <div className='add-prometheus-panel'>
        <Button size='large' onClick={addPanel}>
          <PlusOutlined />
          新增一个查询面板
        </Button>
      </div>
    </>
  );
};

const MetricExplorerPage: React.FC = () => {
  const [metrics, setMetrics] = useState<string[]>([]);

  useEffect(() => {
    getMetrics().then((res) => {
      setMetrics(res.data || []);
    });
  }, []);

  return (
    <PageLayout title='即时查询' icon={<LineChartOutlined />}>
      <div className='prometheus-page'>
        <PanelList metrics={metrics} />
      </div>
    </PageLayout>
  );
};

export default MetricExplorerPage;
