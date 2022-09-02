import React, { useState, useEffect } from 'react';
import { Space } from 'antd';
import moment from 'moment';
import { TimeRangePickerWithRefresh, IRawTimeRange } from '@/components/TimeRangePicker';
import Resolution from '@/components/Resolution';
import { getStepByTimeAndStep } from '@/pages/dashboard/utils';
import AlgoGraph from './AlgoGraph';
import ESGraph from './ESGraph';

export default function index({ data, triggerTime, onClick }) {
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const [step, setStep] = useState<number | null>(15);

  useEffect(() => {
    setRange({
      start: moment.unix(triggerTime).subtract(30, 'minutes'),
      end: moment.unix(triggerTime).add(30, 'minutes'),
    });
  }, [triggerTime]);

  return (
    <div>
      <Space>
        <TimeRangePickerWithRefresh
          value={range}
          onChange={setRange}
          refreshTooltip={data.cate === 'prometheus' ? `刷新间隔小于 step(${getStepByTimeAndStep(range, step)}s) 将不会更新数据` : undefined}
        />
        {data.cate === 'prometheus' && <Resolution value={step} onChange={(v) => setStep(v)} initialValue={step} />}
      </Space>
      {data.rule_algo && <AlgoGraph rid={data.rule_id} tags={data.tags} range={range} step={step} />}
      {data.cate === 'elasticsearch' && <ESGraph eventId={data.id} range={range} triggerTime={triggerTime} onClick={onClick} />}
    </div>
  );
}
