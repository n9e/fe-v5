import React, { useEffect, useState } from 'react'
import { Button, Layout, Row, Col } from 'antd';
import { LineChartOutlined } from '@ant-design/icons'
import PageLayout from '@/components/pageLayout';
import { useTranslation } from 'react-i18next';
import HostSelect from './components/HostSelect';
import MetricSelect from './components/MetricSelect';
import { getHosts } from '@/services';
import { getMetrics } from '@/services/warning';
import './index.less';

export default () => {
  const { t, i18n } = useTranslation();
  const [hosts, setHosts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [graphs, setGraphs] = useState([]);
  useEffect(() => {
    getHosts().then(res => {
      console.log('res', res)
      const allHosts = res?.dat?.list || []
      setHosts(allHosts)
      console.log(allHosts.map(h => h.ident))
      getMetrics().then(res => {
        setMetrics(res.data)
      })
    })
  }, []);
  const handleRemoveGraphs = () => {}
  return <PageLayout title={t('对象视角')} icon={<LineChartOutlined />}>
    <div className='object-view'>
      <Layout style={{ padding: 10 }}>
        <Row gutter={10}>
          <Col span={12}>
            <HostSelect allHosts={hosts} />
          </Col>
          <Col span={12}>
            <MetricSelect metrics={metrics} handleMetricClick={(metric) => {
            }} />
          </Col>
        </Row>
        <Row style={{ padding: '10px 0' }}>
          <Col span={8}>
            datepicker
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
      </Layout>
    </div>
  </PageLayout>
}
