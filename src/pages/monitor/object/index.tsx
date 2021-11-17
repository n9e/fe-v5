import React, { useCallback, useEffect, useState } from 'react';
import { Button, InputNumber, Layout, Row, Col, Checkbox, Popover, Select } from 'antd';
import { LineChartOutlined, SettingOutlined, SyncOutlined, CloseCircleOutlined, ShareAltOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import OrderSort from '@/components/OrderSort';
import { useTranslation } from 'react-i18next';
import HostSelect from './components/HostSelect';
import MetricSelect from './components/MetricSelect';
import DateRangePicker from '@/components/DateRangePicker';
import { Range } from '@/components/DateRangePicker';
import { getHosts } from '@/services';
import { getMetrics } from '@/services/warning';
import _ from 'lodash';
import moment from 'moment';
import './index.less';
import Graph from '@/components/Graph';
import Resolution from '@/components/Resolution';
import * as config from '@/components/Graph/config';
import * as graphUtil from '@/components/Graph/util';

export default () => {
  const { t, i18n } = useTranslation();
  const [hosts, setHosts] = useState([]);
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [graphs, setGraphs] = useState<Array<any>>([]);
  const [step, setStep] = useState(15);
  const [sharedSortDirection, setSharedSortDirection] = useState('desc');
  const [formatUnit, setFormatUnit] = useState(1000);
  const [range, setRange] = useState<Range>({
    start: 0,
    end: 0,
  });

  useEffect(() => {
    getHosts().then((res) => {
      console.log('res', res);
      const allHosts = res?.dat?.list || [];
      setHosts(allHosts);
      setSelectedHosts(allHosts);
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
        <Checkbox
          onChange={(e) => {
            let newGraphs = [...graphs];
            let dstGraph = newGraphs[i];
            dstGraph.shared = e.target.checked;
            setGraphs(newGraphs);
          }}
        >
          <div style={{ display: 'flex' }}>
            <span>Multi Series in Tooltip, order value {sharedSortDirection}</span>
            <OrderSort onChange={(bool) => {
              const v = bool ? 'desc' : 'asc'
              setSharedSortDirection(v);
              let newGraphs = [...graphs];
              let dstGraph = newGraphs[i];
              dstGraph.sharedSortDirection = v
              setGraphs(newGraphs);
            }} />
          </div>
        </Checkbox>
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
        <Checkbox onChange={(e) => {
          let newGraphs = [...graphs];
          let dstGraph = newGraphs[i];
          dstGraph.precision = e.target.checked ? 'short' : 'origin';
          setGraphs(newGraphs);
        }}>
          <div style={{ display: 'flex' }}>
            <span>Value format with: Ki, Mi, Gi by {formatUnit}</span>
            <OrderSort onChange={(bool) => {
                const v = bool ? 1000 : 1024
                setFormatUnit(v);
                let newGraphs = [...graphs];
                let dstGraph = newGraphs[i];
                dstGraph.formatUnit = v
                setGraphs(newGraphs);
              }} />
          </div>
        </Checkbox>
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
                  let newGraphs = [...graphs];
                  newGraphs.push({
                    step,
                    range,
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
            <div style={{display: 'flex'}}>
              <DateRangePicker onChange={(e) => {
                setRange(e);
                let newGraphs = [...graphs];
                newGraphs.forEach(graph => {
                  graph.range = e
                })
                setGraphs(newGraphs);
              }} />
              <Resolution onChange={(v) => {
                setStep(v)
                let newGraphs = [...graphs];
                newGraphs.forEach(graph => {
                  graph.step = v
                })
                setGraphs(newGraphs);
              }} initialValue={step} />
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  graphs.forEach(graph => {
                    const graphInstance = graph.ref?.current
                    graphInstance && graphInstance.refresh()
                  })
                }}
                icon={<SyncOutlined />}></Button>
            </div>
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
            <Button
              onClick={handleRemoveGraphs}
              disabled={!graphs.length}
              style={{ background: '#fff' }}
            >
              清空图表
            </Button>
          </Col>
        </Row>
        <div>
          {_.map(graphs, (o, i) => {
            return <div style={{ marginBottom: 10 }} key={i + o.metric}>
              <Graph ref={o.ref} data={{...o}} graphConfigInnerVisible={true} extraRender={graph => {
                return [
                  <span className="graph-operationbar-item" key="info">
                    <Popover placement="left" content={getContent(graph, i)} trigger="click">
                      <SettingOutlined />
                    </Popover>
                  </span>,
                  <span className="graph-operationbar-item" key="sync">
                    <SyncOutlined onClick={graph.refresh} />
                  </span>,
                  <span className="graph-operationbar-item" key="share">
                    <ShareAltOutlined />
                  </span>,
                  <span className="graph-operationbar-item" key="close">
                    <CloseCircleOutlined onClick={_ => {
                      console.log('graphs', graphs)
                      const newGraphs = [...graphs]
                      newGraphs.splice(i, 1)
                      setGraphs(newGraphs)
                    }} />
                  </span>
                ]
              }}></Graph>
            </div>
          })}
          {graphs.length === 0 && <div className='empty-graph'>请先选中指标生成图表</div>}
        </div>
      </Layout>
    </div>
  </PageLayout>
)}
