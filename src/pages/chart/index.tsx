import React, { useEffect, useState } from 'react';
import { GetTmpChartData } from '@/services/metric';
import { useParams } from 'react-router';
import D3Chart, { Props } from '@/components/D3Chart';
import DateRangePicker from '@/components/DateRangePicker';
import { Range } from '@/components/DateRangePicker';
import { FieldNumberOutlined } from '@ant-design/icons';
import ResfeshIcon from '@/components/RefreshIcon';
import Resolution from '@/components/Resolution';
import './index.less';
import { useTranslation } from 'react-i18next';
export default function Chart() {
  const { t } = useTranslation();
  const { ids } = useParams<{
    ids: string;
  }>();
  const [chartData, setChartData] = useState<Props[]>();
  const [range, setRange] = useState<Range>();
  const [step, setStep] = useState(15);
  useEffect(() => {
    initChart();
  }, []);

  const initChart = () => {
    GetTmpChartData(ids).then((res) => {
      try {
        let data = res.dat
          .filter((item) => !!item)
          .map((item) => {
            return JSON.parse(item.configs);
          });
        setChartData(data);
      } catch (error) {
        console.log(error);
      }
    });
  };

  const handleDateChange = (e) => {
    setRange(e);
  };

  const handleRefresh = () => {
    initChart();
  };

  return (
    <div className='chart-container'>
      {chartData && chartData.length > 0 ? (
        <>
          <div className='chart-container-header'>
            <DateRangePicker
              onChange={handleDateChange}
              value={chartData[0].options.range}
            />
            <Resolution onChange={(v) => setStep(v)} initialValue={step} />
            <ResfeshIcon onClick={handleRefresh} className='reload-icon' />
          </div>
          {chartData.map((item, index) => {
            const options = range ? { ...item.options, range } : item.options;
            return (
              <D3Chart
                key={index}
                options={{ ...options, step }}
                title={item.title}
              ></D3Chart>
            );
          })}
        </>
      ) : (
        <h2 className='holder'>
          <FieldNumberOutlined
            style={{
              fontSize: '30px',
            }}
          />
          <span>{t('该分享链接无图表数据')}</span>
        </h2>
      )}
    </div>
  );
}
