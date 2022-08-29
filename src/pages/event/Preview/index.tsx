import React, { useState } from 'react';
import { Space } from 'antd';
import { TimeRangePickerWithRefresh, IRawTimeRange } from '@/components/TimeRangePicker';
import Resolution from '@/components/Resolution';
import { getStepByTimeAndStep } from '@/pages/dashboard/utils';
import AlgoGraph from './AlgoGraph';
import ESGraph from './ESGraph';

export default function index({ data }) {
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const [step, setStep] = useState<number | null>(15);

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
      {data.cate === 'elasticsearch' && <ESGraph eventId={data.id} range={range} />}
    </div>
  );
}
