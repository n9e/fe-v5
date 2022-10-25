import React, { ReactNode } from 'react';
import { Tooltip } from 'antd';
import { MenuItemProps, isSubMenu } from './types';
import './index.less';
import { useMenuSelect, useMenuActive } from './index';
import classNames from 'classnames';

interface Props {
  item: MenuItemProps;
  subMenuKey?: string;
  collapsed?: boolean;
}

export default function FcMenuItem(props: Props) {
  const { item, subMenuKey, collapsed } = props;
  const [menuSelect, setMenuSelect] = useMenuSelect();
  const [menuActive, setMenuActive] = useMenuActive();
  const handleClick = () => {
    const keys = [item.key];
    subMenuKey && keys.unshift(subMenuKey);
    setMenuSelect(keys);
  };

  const handleHover = () => {
    const keys = [item.key];
    subMenuKey && keys.unshift(subMenuKey);
    setMenuActive(keys);
  };

  return (
    <div
      className={classNames({
        'fc-menu-item': true,
        'fc-menu-item-selected': menuActive.length > 0 ? menuActive.includes(item.key) : menuSelect.includes(item.key),
      })}
      onClick={handleClick}
      onMouseEnter={handleHover}
    >
      {!subMenuKey && (menuActive.length > 0 ? menuActive.includes(item.key) : menuSelect.includes(item.key)) && (
        <>
          <div className='fc-menu-sub-top'></div>
          <div className='fc-menu-sub-topleft-corner'></div>
          <div className='fc-menu-sub-bottomleft-corner'></div>
          <div className='fc-menu-sub-left'></div>
          <div className='fc-menu-sub-bottom'></div>
        </>
      )}
      {collapsed ? (
        <Tooltip title={item.label} placement='right'>
          <span className='fc-menu-item-icon'>{item.icon}</span>
        </Tooltip>
      ) : (
        <span className='fc-menu-item-icon'>{item.icon}</span>
      )}

      {!collapsed && <span className='fc-menu-item-label'>{item.label}</span>}
    </div>
  );
}
