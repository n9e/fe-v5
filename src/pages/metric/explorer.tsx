import React, { useState, useRef } from 'react';
import { Row, Col, Select, Radio, Button } from 'antd';
import MetricTable, { Metric } from './matric';
import MatricTag from './tags';
import D3Chart from '@/components/D3Chart';
import DateRangePicker from '@/components/DateRangePicker';
import ResourceTable from './resourceTable';
import ResfeshIcon from '@/components/RefreshIcon';
import { AreaChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { SetTmpChartData } from '@/services/metric';
import '@d3-charts/ts-graph/dist/index.css';
import './index.less';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import type {
  ChartComponentProps,
  Param,
  isParam,
  RangeItem,
} from '@/store/chart';
const { Option } = Select;
export interface IExplorerProps {
  isIdent?: boolean;
  resourceGroupId?: number;
}
export default function Explorer({ resourceGroupId, isIdent }: IExplorerProps) {
  const { t, i18n } = useTranslation();
  const [idents, setIdents] = useState<Array<string>>([]);
  const metricRef = useRef(null as any);
  const tagRef = useRef(null as any);
  const [numPerLine, setNumPerLine] = useState(1);
  const [range, setRange] = useState<Param | RangeItem>({
    start: 0,
    end: 0,
  });
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [chartOption, setChartOption] = useState<ChartComponentProps>({
    range: {
      start: 0,
      end: 0,
    },
    limit: 3000,
    metric: '',
    description: '',
  });

  const handleChange = (e) => {
    setNumPerLine(e.target.value);
  };

  const handleRefresh = () => {
    formatOption({}, { ...range });
  };

  const handleMetricChange = (items) => {
    setMetrics(items.reverse());
  };

  const handleTagChange = (items) => {
    let tags = items.map((item) => {
      let [key, value] = item.split('=');
      return {
        key,
        value,
      };
    });
    formatOption({
      tags,
    });
  };

  const handleSelectIdent = (idents: Array<string>) => {
    setIdents(idents);
  };

  const handleDateChange = (e) => {
    setRange(e);
    formatOption({}, e);
  };

  const formatOption = (obj = {}, r?: Param | RangeItem) => {
    // 如果是其他参数变化，则不必传r参数，会使用缓存的range
    let newR = r || range;
    setChartOption({ ...chartOption, ...obj, range: newR });
  };

  const handleLimitChange = (limit) => {
    formatOption({
      limit,
    });
  };

  const handleReset = () => {
    metricRef.current.reset();
    tagRef.current.reset();
  };

  const handleShare = async () => {
    let shareData = metrics
      .map((metric, i) => {
        return {
          options: {
            ...chartOption,
            metric: metric.name,
            description: metric.description,
          },
        };
      })
      .map((item) => {
        return {
          configs: JSON.stringify(item),
        };
      });
    let { dat: ids } = await SetTmpChartData(shareData);
    window.open('/chart/' + ids);
  };

  const placeholder = () => (
    <h2 className='holder'>
      <AreaChartOutlined
        style={{
          fontSize: '30px',
        }}
      />
      <span>{t('选择监控指标添加图表')}</span>
    </h2>
  );

  const content = (
    <div className='explore'>
      <Row>
        <Col className='left' span={8}>
          {/* {!isIdent ? (
        <div className={'page-title'}>
          <LineChartOutlined />
          {t('即时看图')}
        </div>
      ) : null} */}
          {isIdent ? (
            <ResourceTable onSelect={handleSelectIdent}></ResourceTable>
          ) : null}
          <div className='panel'>
            <div className='title'>{t('监控指标')}</div>
            <MetricTable
              idents={idents}
              onChange={handleMetricChange}
              ref={metricRef}
            />
          </div>
          {!isIdent ? (
            <div className='panel'>
              <div className='title'>{t('筛选标签')}</div>

              <MatricTag
                metrics={metrics.map((metric) => metric.name)}
                onChange={handleTagChange}
                ref={tagRef}
              />
            </div>
          ) : null}
          <div className='panel'>
            <div className='title'>{t('配置')}</div>
            <div>
              {t('每张图最多展示')}
              <Select
                className='echart-line-num'
                defaultValue='50'
                size='small'
                onChange={handleLimitChange}
              >
                <Option value={50}>50</Option>
                <Option value={100}>100</Option>
                <Option value={200}>200</Option>
                <Option value={500}>500</Option>
              </Select>
              {t('条线')}
            </div>
          </div>

          <Button
            type='primary'
            onClick={handleReset}
            style={{
              marginTop: '10px',
            }}
          >
            {t('重置')}
          </Button>

          <Button
            type='primary'
            disabled={metrics.length === 0}
            onClick={handleShare}
            style={{
              marginTop: '10px',
            }}
          >
            {t('分享图表')}
          </Button>
        </Col>
        <Col className='right' span={16}>
          <div className='header'>
            <div className='header-left'>
              <DateRangePicker onChange={handleDateChange} />
              <ResfeshIcon onClick={handleRefresh} className='reload-icon' />
            </div>
            <Radio.Group value={numPerLine} onChange={handleChange}>
              <Radio.Button value={4}>XS</Radio.Button>
              <Radio.Button value={3}>S</Radio.Button>
              <Radio.Button value={2}>M</Radio.Button>
              <Radio.Button value={1}>L</Radio.Button>
            </Radio.Group>
          </div>
          <div className='chart-list'>
            <Row gutter={15}>
              {metrics.length > 0
                ? metrics.map((metric, i) => {
                    return (
                      <Col key={metric.name} span={24 / numPerLine}>
                        <D3Chart
                          cached
                          options={{
                            ...chartOption,
                            idents: idents.length > 0 ? idents : undefined,
                            metric: metric.name,
                            description: metric.description,
                          }}
                        />
                      </Col>
                    );
                  })
                : placeholder()}
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );

  return isIdent ? (
    <div>{content}</div>
  ) : (
    <PageLayout title={t('即时看图')} icon={<LineChartOutlined />}>
      {content}
    </PageLayout>
  );
}
