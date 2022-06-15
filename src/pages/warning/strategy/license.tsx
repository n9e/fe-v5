import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { getBrainLicense } from '@/services/warning';

export default function License() {
  const [days, setDays] = useState<any>();
  const [rules, setRules] = useState<any>();
  useEffect(() => {
    const now = moment().unix();
    getBrainLicense().then((res) => {
      setDays(_.round((res?.data?.expire - now) / 86400));
      setRules(res?.data?.rules_remaining);
      window.localStorage.setItem('license_rules_remaining', _.toString(res?.data?.rules_remaining));
    });
  }, []);
  if (!days) return null;
  return (
    <div style={{ marginRight: 20 }}>
      <Tooltip
        title={
          <div>
            <div>还剩 {days} 天到期</div>
            <div>还可添加 {rules} 条规则</div>
          </div>
        }
      >
        <div
          style={{
            background: '#EBE8F2',
            borderRadius: 16,
            color: '#6C53B1',
            fontSize: 12,
            padding: '2px 8px',
          }}
        >
          还剩 {days} 天到期
        </div>
      </Tooltip>
    </div>
  );
}
