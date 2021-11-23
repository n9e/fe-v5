import PageLayout from '@/components/pageLayout';
import { CloseCircleOutlined, LineChartOutlined, PlusOutlined, SearchOutlined, SettingFilled } from '@ant-design/icons';
import { Button, Input, Modal, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';
import { generateID } from '@/utils';
import { getMetrics } from '@/services/warning';
import { PanelDefaultOptions, PanelOptions } from './panel';
import Panel from './panel';

type PanelMeta = { id: string; options: PanelOptions };

interface PanelListProps {
  metrics: string[];
}

const PanelList: React.FC<PanelListProps> = ({ metrics }) => {
  const [panelList, setPanelList] = useState<PanelMeta[]>([{ id: generateID(), options: PanelDefaultOptions }]);

  // 添加一个查询面板
  function addPanel() {
    setPanelList((a) => [
      ...panelList,
      {
        id: generateID(),
        options: {...PanelDefaultOptions},
      },
    ]);
  }

  // 删除指定查询面板
  function removePanel(id) {
    setPanelList(panelList.reduce<PanelMeta[]>((acc, panel) => (panel.id !== id ? [...acc, { ...panel }] : acc), []));
  }

  return (
    <>
      {panelList.map(({ id, options }) => 
        <Panel
          key={id}
          options={options}
          onOptionsChanged={(opts) => {
            setPanelList(panelList.map((p) => (id === p.id ? { ...p, options: opts } : p)));
          }}
          metrics={metrics}
          removePanel={() => removePanel(id)}
        />
        // Panel(metrics, options, (opts) => {
        //   setPanelList(panelList.map((p) => (id === p.id ? { ...p, options: opts } : p)));
        // }, () => removePanel(id))
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

const FakeName: React.FC = () => {
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

export default FakeName;
