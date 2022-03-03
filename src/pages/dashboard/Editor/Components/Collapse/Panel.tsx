import React, { useState } from 'react';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import classnames from 'classnames';

interface IProps {
  isActive?: boolean;
  header: string;
  children: React.ReactNode;
}

export default function Panel(props: IProps) {
  const [isActive, setIsActive] = useState<boolean>(props.isActive || true);
  return (
    <div
      className={classnames({
        'n9e-collapse-item': true,
        'n9e-collapse-item-active': isActive,
      })}
    >
      <div
        className='n9e-collapse-header'
        onClick={() => {
          setIsActive(!isActive);
        }}
      >
        {isActive ? <DownOutlined className='n9e-collapse-arrow' /> : <RightOutlined className='n9e-collapse-arrow' />}
        {props.header}
      </div>
      <div
        className={classnames({
          'n9e-collapse-content': true,
          'n9e-collapse-content-hidden': !isActive,
        })}
      >
        <div className='n9e-collapse-content-box'>{props.children}</div>
      </div>
    </div>
  );
}
