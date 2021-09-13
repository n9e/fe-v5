import React, { useEffect, useRef, useState, ReactNode, memo } from 'react';
import { useLocation } from 'react-router-dom';
import TsGraph from '@d3-charts/ts-graph';
import { DataSource, ChartComponentProps } from '@/store/chart';
import { GetData } from '@/services/metric';
import { ReloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import TagFilterForChart from '@/components/TagFilterForChart';
import { Tag as TagType } from '@/store/chart';
import { Checkbox, Tooltip, Button } from 'antd';
import {
  generateTimeStampRange,
  isAbsoluteRange,
  Range,
} from '@/components/DateRangePicker';
import OrderSort from '@/components/OrderSort';
import { SetTmpChartData } from '@/services/metric';
import './index.less';
import { useTranslation } from 'react-i18next';
type BarControl = Boolean | 'multiOrSort';
export interface Props {
  cached?: boolean;
  title?: string;
  options: ChartComponentProps;
  barControl?: BarControl;
  rightBar?: ReactNode;
}
function Chart(props: Props) {
  const { t } = useTranslation();
  const { options, barControl, rightBar, title } = props;
  const [refreshing, setRefreshing] = useState(false);
  const chartRef = useRef(null);
  const location = useLocation();
  const {
    metric,
    description = '',
    tags,
    range,
    limit,
    idents,
    classpath_id,
    classpath_prefix,
    prome_ql,
    yplotline,
    xplotline,
    step,
  } = options;

  const [privateTags, setPrivateTags] = useState<TagType[]>([]);
  const [multi, setMulti] = useState(false);
  const [sort, setSort] = useState<'desc' | 'asc'>('desc');
  const [tooltipFormat, setTooltipFormat] =
    useState<'origin' | 'short'>('origin');
  const [instance, setInstance] =
    useState<{
      destroy: Function;
      update: Function;
      options: {
        yAxis: object;
        xAxis: object;
      };
    } | null>(null); // transfer Param and RangeItem into timestamp

  const formatDate = (r?: Range) => {
    let newR = r || range;

    if (newR) {
      if (isAbsoluteRange(newR)) {
        const { start, end } = newR;
        return {
          start,
          end,
        };
      } else {
        return generateTimeStampRange(newR);
      }
    }

    return {
      start: 0,
      end: 0,
    };
  };

  const { start, end } = formatDate(range);

  const initChart = (privateTags: TagType[] = []) => {
    let newTags = privateTags;

    if (tags && tags.length > 0) {
      newTags = tags.concat(newTags);
    }

    let params = Array.isArray(metric)
      ? metric.map((item) => {
          return {
            metric: item,
            classpath_id,
            classpath_prefix:
              classpath_prefix === undefined
                ? undefined
                : classpath_prefix
                ? 1
                : 0,
            prome_ql,
            tags: newTags && newTags.length > 0 ? newTags : undefined,
            idents,
          };
        })
      : Array.isArray(prome_ql)
      ? prome_ql.map((item) => {
          return {
            metric,
            classpath_id,
            classpath_prefix:
              classpath_prefix === undefined
                ? undefined
                : classpath_prefix
                ? 1
                : 0,
            prome_ql: item,
            tags: newTags && newTags.length > 0 ? newTags : undefined,
            idents,
          };
        })
      : [
          {
            metric,
            classpath_id,
            classpath_prefix: classpath_prefix ? 1 : 0,
            prome_ql,
            tags: newTags && newTags.length > 0 ? newTags : undefined,
            idents,
          },
        ];
    GetData({
      params,
      start,
      end,
      limit,
      step,
    }).then((data) => {
      const dataY: DataSource[] = [];
      data.dat.forEach((dataItem) => {
        dataY.push({
          name: dataItem.metric,
          data: dataItem.values.map((item) => item.v),
        });
      });
      const series: Array<any> = [];
      data.dat.forEach((dataItem) => {
        const { metric, values, tags } = dataItem;
        const seriesData = values.map((item) => {
          return {
            timestamp: item.t * 1000,
            value: item.v,
          };
        });
        series.push({
          name: (metric ? `【${metric}】` : '') + tags,
          data: seriesData,
        });
      }); // if (chartRef.current) {
      //   // @ts-ignore
      //   chartRef.current.innerHTML = '';
      // }

      let graphOption = instance
        ? {
            series: series,
            tooltip: {
              precision: tooltipFormat,
              shared: multi,
              sharedSortDirection: sort,
            },
            // 必须xAxis和yAxis必须将属性返回
            yAxis: {
              ...instance.options.yAxis,
              plotLines: yplotline
                ? [
                    {
                      value: yplotline,
                      color: 'red',
                    },
                  ]
                : undefined,
            },
            xAxis: {
              ...instance.options.xAxis,
              plotLines: xplotline
                ? [
                    {
                      value: xplotline * 1000,
                      color: 'red',
                    },
                  ]
                : undefined,
            },
          }
        : {
            timestamp: 'x',
            xkey: 'timestamp',
            ykey: 'value',
            chart: {
              renderTo: chartRef.current,
            },
            yAxis: {
              plotLines: yplotline
                ? [
                    {
                      value: yplotline,
                      color: 'red',
                    },
                  ]
                : undefined,
            },
            xAxis: {
              plotLines: xplotline
                ? [
                    {
                      value: xplotline * 1000,
                      color: 'red',
                    },
                  ]
                : undefined,
            },
            series: series,
            tooltip: {
              precision: tooltipFormat,
              shared: multi,
              sharedSortDirection: sort,
            },
          };

      if (instance) {
        instance.update(graphOption);
      } else {
        setInstance(new TsGraph(graphOption));
      }
    });
  };

  useEffect(() => {
    initChart(privateTags);
  }, [options, multi, sort, tooltipFormat]);

  // each chart is mounted once, when props and state change, the instance will update.
  // so below hook only run once.
  useEffect(() => {
    return () => {
      instance && instance.destroy();
    };
  }, [instance]);

  const handleRefresh = (e) => {
    if (refreshing) return;
    setRefreshing(true);
    initChart(privateTags); //需要将选择的过滤器传进去

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleChartTagsChange = (e: TagType[]) => {
    setPrivateTags(e);
    initChart(e);
  };

  const handleMultiChange = (e) => {
    setMulti(e.target.checked);
  };

  const handleOrderSortChange = (bool) => {
    setSort(bool ? 'desc' : 'asc');
  };

  const handleTooltipFormat = (e) => {
    setTooltipFormat(e.target.checked ? 'short' : 'origin');
  };

  const renderMultiOrSort = (
    <>
      <Tooltip title={t('tooltip中展示所有曲线的值')}>
        <Checkbox onChange={handleMultiChange}>Multi</Checkbox>
      </Tooltip>
      <Tooltip
        title={
          <>
            <span>{t('SI格式化:')}</span>
            <a
              type='link'
              href='https://en.wikipedia.org/wiki/Metric_prefix#List_of_SI_prefixes'
              target='_blank'
            >
              {t('文档')}
            </a>
          </>
        }
      >
        <Checkbox onChange={handleTooltipFormat}>Format</Checkbox>
      </Tooltip>
      <OrderSort onChange={handleOrderSortChange} />
    </>
  );
  return (
    <div className='chart-wrapper'>
      {(title || rightBar || description || metric) && (
        <div className='chart-title'>
          {title ? (
            <div className='chart-title-label'>{title}</div>
          ) : (
            <div className='chart-title-label'>
              {metric} {description}
            </div>
          )}

          <div className='chart-title-right-bar'>
            {rightBar}
            {!location.pathname.startsWith('/chart/') && (
              <Button
                type='link'
                size='small'
                onClick={async (e) => {
                  e.preventDefault();
                  let { dat: ids } = await SetTmpChartData([
                    { configs: JSON.stringify({ title, options, barControl }) },
                  ]);
                  window.open('/chart/' + ids);
                }}
              >
                <ShareAltOutlined />
              </Button>
            )}
          </div>
        </div>
      )}
      {!barControl && (
        <div className='chart-filter'>
          <ReloadOutlined
            className='refresh'
            spin={refreshing}
            onClick={handleRefresh}
          />
          {renderMultiOrSort}
          {!prome_ql && (
            <TagFilterForChart
              options={{
                ...options,
                start,
                end,
                idents,
              }}
              onChange={handleChartTagsChange}
            />
          )}
        </div>
      )}

      {barControl === 'multiOrSort' && (
        <div className='chart-filter'>{renderMultiOrSort}</div>
      )}

      <div ref={chartRef} className='chart-content'></div>
    </div>
  );
}

function areEqual(pre, next) {
  return (
    pre.cached &&
    pre.options.range === next.options.range &&
    pre.options.step === next.options.step
  );
}

export default memo(Chart, areEqual);
