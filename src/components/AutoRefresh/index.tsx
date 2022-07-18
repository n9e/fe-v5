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
import { Dropdown, Button, Menu, Tooltip } from 'antd';
import { DownOutlined, UpOutlined, SyncOutlined } from '@ant-design/icons';
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
  tooltip?: string;
  onRefresh: () => void;
}

function Refresh(props: IProps, ref) {
  const intervalSecondsCache = _.toNumber(window.localStorage.getItem('event-interval-seconds'));
  const [intervalSeconds, setIntervalSeconds] = useState(intervalSecondsCache);
  const [visible, setVisible] = useState(false);
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
  }, [intervalSeconds, props.onRefresh]);

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
      window.localStorage.setItem('event-interval-seconds', '0');
    },
  }));

  return (
    <div className='auto-refresh-container'>
      <Tooltip title={props.tooltip}>
        <Button className='refresh-btn' icon={<SyncOutlined />} onClick={props.onRefresh} />
      </Tooltip>
      <Dropdown
        trigger={['click']}
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        overlay={
          <Menu
            onClick={(e) => {
              setIntervalSeconds(_.toNumber(e.key));
              window.localStorage.setItem('event-interval-seconds', e.key);
              setVisible(false);
            }}
          >
            {_.map(refreshMap, (text, value) => {
              return <Menu.Item key={value}>{text}</Menu.Item>;
            })}
          </Menu>
        }
      >
        <Button
          onClick={() => {
            setVisible(!visible);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {refreshMap[intervalSeconds]} {visible ? <UpOutlined /> : <DownOutlined style={{ fontSize: 12 }} />}
        </Button>
      </Dropdown>
    </div>
  );
}

export default React.forwardRef(Refresh);
