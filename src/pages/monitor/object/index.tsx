import React, { useEffect, useState, useCallback } from 'react';
import { Button, InputNumber, Layout, Row, Col, Checkbox, Popover, Select } from 'antd';
import { LineChartOutlined, SyncOutlined, CloseCircleOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { useTranslation } from 'react-i18next';
import HostSelect from './components/HostSelect';
import MetricSelect from './components/MetricSelect';
import DateRangePicker from '@/components/DateRangePicker';
import { Range } from '@/components/DateRangePicker';
import { getHosts } from '@/services';
import { getMetrics, getMetricsDesc } from '@/services/warning';
import _ from 'lodash';
import './index.less';
import Graph from '@/components/Graph';
import Resolution from '@/components/Resolution';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';

export default () => {
  const { t, i18n } = useTranslation();
  const [hosts, setHosts] = useState([]);
  const [selectedHosts, setSelectedHosts] = useState([]);
  const { busiGroups, curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [busiGroup, setBusiGroup] = useState(curBusiItem)
  const [metrics, setMetrics] = useState([]);
  const [metricDescs, setMetricDescs] = useState({});
  const [graphs, setGraphs] = useState<Array<any>>([]);
  const [step, setStep] = useState(15);
  const [queryHost, setQueryHost] = useState('');
  const [curCluster, setCurCluster] = useState('');
  const [range, setRange] = useState<Range>({
    start: 0,
    end: 0,
  });
  const getHostsRequest = () => {
    const cluster = localStorage.getItem('curCluster')
    let transportData = {
      bgid: busiGroup.id,
      query: queryHost,
      clusters: cluster
    }
    return getHosts(transportData).then((res) => {
      const allHosts = res?.dat?.list || [];
      setHosts(allHosts);
      return allHosts
    });
  }

  useEffect(() => {
    getHostsRequest().then(allHosts => {
      getMetricsAndDesc(allHosts.slice(0, 10));
    })
  }, [])

  useEffect(() => {
    getHostsRequest()
  }, [busiGroup, queryHost, curCluster]);
  const getMetricsAndDesc = (hosts) => {
    const showHosts = hosts || selectedHosts
    const hostsMatchParams = `ident=~"${showHosts.map((h: any) => h.ident).join('|')}"`
    getMetrics({
      match: [hostsMatchParams]
    }).then((res) => {
      setMetrics(res.data);
      const newGraphs = graphs.map((graph) => ({
        ...graph,
        showHosts,
      }));
      setGraphs(newGraphs);
      getMetricsDesc(res.data).then(res => {
        setMetricDescs(res.dat)
      })
    });
  };
  const handleRemoveGraphs = () => {
    setGraphs([]);
  };
  const debouncedChangeHostName = useCallback(
    _.debounce((v) => {
      setQueryHost(v)
    }, 1000),
    [],
  );

  return (
    <PageLayout title={t('对象视角')} icon={<LineChartOutlined />} onChangeCluster={cluster => {
      setCurCluster(cluster)
    }}>
      <div className='object-view'>
        <Layout style={{ padding: 10 }}>
          <Row gutter={10}>
            <Col span={12}>
              <HostSelect
                allHosts={hosts}
                changeBusiGroup={(busiGroup) => {
                  setBusiGroup(busiGroup)
                }}
                changeSelectedHosts={(hosts) => {
                  setSelectedHosts(hosts);
                }}
                onSearchHostName={value => {
                  debouncedChangeHostName(value)
                }}
              />
            </Col>
            <Col span={12}>
              <MetricSelect
                metrics={metrics}
                metricDescs={metricDescs}
                selectedMetrics={graphs.map(g => g.metric)}
                handleMetricClick={(metric) => {
                  let newGraphs = [...graphs];
                  const alreadyHaveGraphIndex = newGraphs.findIndex(g => g.metric === metric)
                  const orgGraph = newGraphs[alreadyHaveGraphIndex]
                  if (alreadyHaveGraphIndex !== -1) {
                    newGraphs.splice(alreadyHaveGraphIndex, 1)
                    newGraphs.unshift(orgGraph)
                  } else {
                    newGraphs.unshift({
                      step,
                      range,
                      selectedHosts,
                      metric,
                      ref: React.createRef(),
                    });
                  }
                  setGraphs(newGraphs);
                }}
                handleRefreshMetrics={getMetricsAndDesc}
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
                  <Button type='link' size='small' onClick={(e) => e.preventDefault()}>
                    <CloseCircleOutlined onClick={_ => {
                      console.log('graphs', graphs)
                      const newGraphs = [...graphs]
                      newGraphs.splice(i, 1)
                      setGraphs(newGraphs)
                    }} />
                </Button>
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
