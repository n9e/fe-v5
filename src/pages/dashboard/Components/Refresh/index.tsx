/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
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

function Refresh(props: IProps, ref) {
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

  useImperativeHandle(ref, () => ({
    closeRefresh() {
      setIntervalSeconds(0);
      window.localStorage.setItem('refresh-interval-seconds', '0');
    },
  }));

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

export default React.forwardRef(Refresh);
