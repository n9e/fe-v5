import React, { useEffect, useState } from 'react';
import { Drawer, Space } from 'antd';
import _ from 'lodash';
import { getBrainData } from '@/services/warning';
import DateRangePicker from '@/components/DateRangePicker';
import Resolution from '@/components/Resolution';
import { Range, formatPickerDate } from '@/components/DateRangePicker';
import Graph from '@/pages/event/Graph';
import PromQLInput from '@/components/PromQLInput';

interface IProps {
  rid: string;
  uuid: string;
  promql: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}
const serieColorMap = {
  origin: '#573BA7',
  upper_bound: '#1A94FF',
  lower_bound: '#2ACA96',
  anomaly: 'red',
};

export default function GraphCpt(props: IProps) {
  const { rid, uuid, promql, visible, setVisible } = props;
  const [range, setRange] = useState<Range>({
    num: 1,
    unit: 'hour',
    description: '',
  });
  const [step, setStep] = useState<number | null>(15);
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    let { start, end } = formatPickerDate(range);
    let _step = step;
    if (!step) _step = Math.max(Math.floor((end - start) / 240), 1);
    if (rid && uuid) {
      getBrainData({
        rid,
        uuid,
        start,
        end,
        step: _step,
      }).then((res) => {
        const dat = _.map(
          _.filter(res.data, (item) => {
            return item.metric.value_type !== 'predict';
          }),
          (item) => {
            const type = item.metric.value_type;
            return {
              name: `${type}`,
              data: item.values,
              color: serieColorMap[type],
              lineDash: type === 'origin' || type === 'anomaly' ? [] : [4, 4],
            };
          },
        );
        const newSeries: any[] = [];
        const origin = _.cloneDeep(_.find(dat, { name: 'origin' }));
        const lower = _.find(dat, { name: 'lower_bound' });
        const upper = _.find(dat, { name: 'upper_bound' });

        newSeries.push({
          name: 'lower_upper_bound',
          data: _.map(lower?.data, (dataItem, idx) => {
            if (upper) {
              return [...dataItem, upper?.data[idx][1]];
            }
            return [];
          }),
          color: '#ddd',
          opacity: 0.5,
        });

        if (origin) {
          newSeries.push(origin);
        }
        setSeries(newSeries);
      });
    }
  }, [rid, uuid, JSON.stringify(range), step]);

  return (
    <Drawer
      title='曲线详情'
      width={800}
      placement='right'
      onClose={() => {
        setVisible(false);
      }}
      visible={visible}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <PromQLInput readonly url='/api/n9e/prometheus' value={promql} />
          <Space>
            <DateRangePicker value={range} onChange={setRange} />
            <Resolution value={step} onChange={(v) => setStep(v)} initialValue={step} />
          </Space>
        </div>
        <Graph series={series} />
      </div>
    </Drawer>
  );
}
