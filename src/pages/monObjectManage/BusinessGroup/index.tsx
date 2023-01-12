import React, { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
import _ from 'lodash';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { Input } from 'antd';
import { LeftOutlined, RightOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getBusiGroups } from '@/services/common';

interface IProps {
  curBusiId?: number;
  setCurBusiId?: (id: number, item: any) => void;
  title?: string;
  renderHeadExtra?: () => React.ReactNode;
}

export default function index(props: IProps) {
  const { title = '业务组', renderHeadExtra, curBusiId, setCurBusiId } = props;
  const history = useHistory();
  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('leftwidth') || 200));
  const [businessGroupData, setBusinessGroupData] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    getBusiGroups('').then((res) => {
      setBusinessGroupData(res.dat || []);
    });
  }, []);

  return (
    <Resizable
      style={{
        marginRight: collapse ? 0 : 10,
      }}
      size={{ width: collapse ? 0 : width, height: '100%' }}
      enable={{
        right: collapse ? false : true,
      }}
      onResizeStop={(e, direction, ref, d) => {
        let curWidth = width + d.width;
        if (curWidth < 200) {
          curWidth = 200;
        }
        setWidth(curWidth);
        localStorage.setItem('leftwidth', curWidth.toString());
      }}
    >
      <div className={collapse ? 'left-area collapse' : 'left-area'}>
        <div
          className='collapse-btn'
          onClick={() => {
            localStorage.setItem('leftlist', !collapse ? '1' : '0');
            setCollapse(!collapse);
          }}
        >
          {!collapse ? <LeftOutlined /> : <RightOutlined />}
        </div>
        <div className='left-area-group group-shrink'>
          {renderHeadExtra && renderHeadExtra()}
          <div className='left-area-group-title'>
            {title}
            {title === '业务组' && <SettingOutlined onClick={() => history.push(`/busi-groups`)} />}
          </div>
          <Input
            className='left-area-group-search'
            prefix={<SearchOutlined />}
            onPressEnter={(e) => {
              e.preventDefault();
              const value = e.currentTarget.value;
              getBusiGroups(value).then((res) => {
                setBusinessGroupData(res.dat || []);
              });
            }}
            placeholder={'请输入业务组名称进行筛选'}
          />
          <div className='radio-list'>
            {_.map(businessGroupData, (item) => {
              return (
                <div
                  className={classNames({
                    'n9e-metric-views-list-content-item': true,
                    active: item.id == curBusiId,
                  })}
                  key={item.id}
                  onClick={() => {
                    if (item.id !== curBusiId) {
                      setCurBusiId && setCurBusiId(item.id, item);
                    }
                  }}
                >
                  <span className='name'>{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Resizable>
  );
}
