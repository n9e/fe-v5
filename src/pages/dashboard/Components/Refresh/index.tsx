import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, Button, Menu } from 'antd';
import { DownOutlined, SyncOutlined } from '@ant-design/icons';
import _ from 'lodash';
import './style.less';

const refreshMap = {
  0: 'off',
  5: '5s',
  10: '10s',
  20: '20s',
  30: '30s',
  60: '1m',
  120: '2m',
  180: '3m',
  300: '5m',
  600: '10m',
};

interface IProps {
  onRefresh: () => void;
}

const intervalSecondsCache = _.toNumber(window.localStorage.getItem('refresh-interval-seconds'));

export default function Refresh(props: IProps) {
  const [intervalSeconds, setIntervalSeconds] = useState(intervalSecondsCache);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (intervalSeconds) {
      intervalRef.current = setInterval(() => {
        props.onRefresh();
      }, intervalSeconds * 1000);
    }
  }, [intervalSeconds]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className='refresh-container'>
      <Button className='refresh-btn' icon={<SyncOutlined />} onClick={props.onRefresh} />
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu
            onClick={(e) => {
              setIntervalSeconds(_.toNumber(e.key));
              window.localStorage.setItem('refresh-interval-seconds', _.toString(e.key));
            }}
          >
            {_.map(refreshMap, (text, value) => {
              return <Menu.Item key={value}>{text}</Menu.Item>;
            })}
          </Menu>
        }
      >
        <Button>
          {refreshMap[intervalSeconds]} <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  );
}
