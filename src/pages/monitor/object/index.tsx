import React, { useEffect, useState } from 'react';
import { Button, Layout, Row, Col, Checkbox, Popover, Select } from 'antd';
import { LineChartOutlined, SettingOutlined, SyncOutlined, CloseCircleOutlined, ShareAltOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { useTranslation } from 'react-i18next';
import HostSelect from './components/HostSelect';
import MetricSelect from './components/MetricSelect';
import { getHosts } from '@/services';
import { getMetrics } from '@/services/warning';
import _ from 'lodash';
import moment from 'moment';
import './index.less';
import Graph from '@/components/Graph';
import * as config from '@/components/Graph/config';
import * as graphUtil from '@/components/Graph/util';

export default () => {
  const { t, i18n } = useTranslation();
  const [hosts, setHosts] = useState([]);
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [graphs, setGraphs] = useState<Array<any>>([]);

  const now = moment();
  const start = now.clone().subtract(3600000, 'ms').format('x');
  const end = now.clone().format('x');
  const initTimeVal = graphUtil.getTimeLabelVal(start, end, 'value');
  const [timeVal, setTimeVal] = useState(initTimeVal);
  useEffect(() => {
    getHosts().then((res) => {
      console.log('res', res);
      const allHosts = res?.dat?.list || [];
      setHosts(allHosts);
      setSelectedHosts(allHosts);
      console.log(allHosts.map((h) => h.ident));
      getMetrics().then((res) => {
        setMetrics(res.data);
      });
    });
  }, []);
  useEffect(() => {
    const newGraphs = graphs.map((graph) => ({
      ...graph,
      selectedHosts,
    }));
    setGraphs(newGraphs);
  }, [selectedHosts.map((h: any) => h.ident).join('')]);
  const handleRemoveGraphs = () => {
    setGraphs([]);
  };
  const getContent = (graph, i) => {
    return (
      <div>
        <Checkbox onChange={() => {}}>Multi Series in Tooltip, order value desc</Checkbox>
        <br />
        <Checkbox
          onChange={(e) => {
            let newGraphs = [...graphs];
            let dstGraph = newGraphs[i];
            dstGraph.legend = e.target.checked;
            setGraphs(newGraphs);
          }}
        >
          Show Legend
        </Checkbox>
        <br />
        <Checkbox onChange={() => {}}>Value format with: Ki, Mi, Gi by 1024</Checkbox>
      </div>
    );
  };
  return (
    <PageLayout title={t('对象视角')} icon={<LineChartOutlined />}>
      <div className='object-view'>
        <Layout style={{ padding: 10 }}>
          <Row gutter={10}>
            <Col span={12}>
              <HostSelect
                allHosts={hosts}
                changeSelectedHosts={(hosts) => {
                  console.log('host select hosts', hosts);
                  setSelectedHosts(hosts);
                }}
              />
            </Col>
            <Col span={12}>
              <MetricSelect
                metrics={metrics}
                handleMetricClick={(metric) => {
                  const now = moment();
                  let newGraphs = [...graphs];
                  newGraphs.push({
                    // id: Number(_.uniqueId()),
                    // now: now.clone().format('x'),
                    start: now.clone().subtract(timeVal, 'ms').format('x'),
                    end: now.clone().format('x'),
                    selectedHosts,
                    metric,
                    ref: React.createRef(),
                  });
                  setGraphs(newGraphs);
                }}
              />
            </Col>
          </Row>
          <Row style={{ padding: '10px 0' }}>
            <Col span={8}>
              <Select
                style={{ width: 80 }}
                value={timeVal}
                onChange={(v) => {
                  setTimeVal(v);
                }}
                placeholder='无'
              >
                {_.map(config.time, (o) => {
                  return (
                    <Select.Option key={o.value} value={o.value}>
                      {o.label}
                    </Select.Option>
                  );
                })}
              </Select>
              <Button style={{ marginLeft: 8 }}>Res.(s)</Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  graphs.forEach((graph) => {
                    const graphInstance = graph.ref?.current;
                    graphInstance && graphInstance.refresh();
                  });
                }}
                icon={<SyncOutlined />}
              ></Button>
            </Col>
            <Col span={16} style={{ textAlign: 'right' }}>
              <Button onClick={handleRemoveGraphs} disabled={!graphs.length} style={{ background: '#fff' }}>
                清空图表
              </Button>
            </Col>
          </Row>
          <div>
            {_.map(graphs, (o, i) => {
              return (
                <div style={{ marginBottom: 10 }}>
                  <Graph
                    ref={o.ref}
                    data={o}
                    key={i}
                    timeVal={timeVal}
                    extraRender={(graph) => {
                      return [
                        <span className='graph-operationbar-item' key='info'>
                          <Popover placement='left' content={getContent(graph, i)} trigger='click'>
                            <SettingOutlined />
                          </Popover>
                        </span>,
                        <span className='graph-operationbar-item' key='sync'>
                          <SyncOutlined onClick={graph.refresh} />
                        </span>,
                        <span className='graph-operationbar-item' key='share'>
                          <ShareAltOutlined />
                        </span>,
                        <span className='graph-operationbar-item' key='close'>
                          <CloseCircleOutlined
                            onClick={(_) => {
                              const newGraphs = [...graphs];
                              newGraphs.splice(i, 1);
                              setGraphs(newGraphs);
                            }}
                          />
                        </span>,
                      ];
                    }}
                  ></Graph>
                </div>
              );
            })}
            {graphs.length === 0 && <div className='empty-graph'>请先选中指标生成图表</div>}
          </div>
        </Layout>
      </div>
    </PageLayout>
  );
};
