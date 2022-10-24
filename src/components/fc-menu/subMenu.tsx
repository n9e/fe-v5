import React, { ReactNode, useState } from 'react';
import { Tooltip, Menu } from 'antd';
import { SubMenuProps } from './types';
import './index.less';
import Item from './menuItem';
import classNames from 'classnames';
import { useMenuSelect, useMenuActive } from './index';
interface Props {
  item: SubMenuProps;
  collapsed: boolean;
}

export default function FcSubMenu(props: Props) {
  const { item, collapsed } = props;
  const [menuSelect, setMenuSelect] = useMenuSelect();
  const [menuActive, setMenuActive] = useMenuActive();
  const [collapse, setCollapse] = useState(false);

  const selected = menuSelect.includes(item.key) && menuSelect.length > 1;
  const menu = (
    <Menu onClick={({ key }) => setMenuSelect([item.key, key])}>
      {item.children.map((item) => (
        <Menu.Item key={item.key}>{item.label}</Menu.Item>
      ))}
    </Menu>
  );
  return (
    <div
      className={classNames({
        'fc-menu-sub': true,
        'fc-menu-sub-open': collapse,
        'fc-menu-sub-selected': menuActive.length > 0 ? menuActive.includes(item.key) : selected,
      })}
      onMouseEnter={() => {
        setCollapse(true);
        setMenuActive([item.key]);
      }}
      onMouseLeave={() => {
        setCollapse(false);
      }}
    >
      {(collapse || menuActive.length > 0 ? menuActive.includes(item.key) : selected) && (
        <>
          <div className='fc-menu-sub-top'></div>
          <div className='fc-menu-sub-topleft-corner'></div>
          <div className='fc-menu-sub-bottomleft-corner'></div>
          <div className='fc-menu-sub-left'></div>
          <div className='fc-menu-sub-bottom'></div>
        </>
      )}
      <div className='fc-menu-sub-title' onMouseEnter={() => setMenuActive([item.key])}>
        {collapsed ? (
          <Tooltip title={menu} placement='right' color='white' overlayClassName='fc-menu-sub-tooltip'>
            <span className='fc-menu-sub-title-icon'>{item.icon}</span>
          </Tooltip>
        ) : (
          <span className='fc-menu-sub-title-icon'>{item.icon}</span>
        )}
        {!collapsed && <span className='fc-menu-sub-title-label'>{item.label}</span>}
      </div>
      {!collapsed && (collapse || selected) && item.children.filter((i) => !!i).map((i) => <Item key={i.key} item={i} subMenuKey={item.key} collapsed={collapsed} />)}
    </div>
  );
}
