import React, { useState, useEffect } from 'react';
import { getOver } from '@/services/overview';
import Statistics from './component/statistics';
import Indicators from './component/indicators';
import Event from './component/event';
import { OverListItem } from '@/store/overview';
import { overListDefaut } from './const';
import './index.less';
import { useTranslation } from 'react-i18next';

const Overview: React.FC = () => {
  const [isMounted, setIsMounted] = useState(true);
  const { t, i18n } = useTranslation();
  const [overList, setOverList] = useState<OverListItem[]>(overListDefaut(t));
  const [eventTotalDay, setEventTotalDay] = useState<number>(0);
  const [eventTotalWeek, setEventTotalWeek] = useState<number>(0);
  const [eventTotalMonth, setEventTotalMonth] = useState<number>(0);

  const getStatistic = async () => {
    const data = await getOver();
    if (data?.dat) {
      const res = data.dat;
      let overList = overListDefaut(t);
      overList.forEach((item, index) => {
        const objV = { ...item, num: res[item.id] };
        overList[index] = objV;
      });
      const overListNew = [...overList];

      if (isMounted) {
        setOverList(overListNew);
        setEventTotalDay(res.event_total_day);
        setEventTotalWeek(res.event_total_week);
        setEventTotalMonth(res.event_total_month);
      }
    }
  };

  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    getStatistic();
  }, [t]);
  return (
    <div className='overview_con' id='overview_con'>
      <div className='part'>
        <div className='title'>{t('统计数据')}</div>
        <Statistics list={overList} spanNum={4}></Statistics>
      </div>
      <Indicators></Indicators>
      <Event
        event_total_day={eventTotalDay}
        event_total_week={eventTotalWeek}
        event_total_month={eventTotalMonth}
      ></Event>
    </div>
  );
};

export default Overview;
