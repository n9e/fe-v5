import React, { ReactNode, useState, useContext, useEffect } from 'react';
import { Tooltip, Menu } from 'antd';
import { SubMenuProps } from './types';
import './index.less';
import Item from './menuItem';
import classNames from 'classnames';
import { useMenuSelect, useMenuActive, Context } from './index';
interface Props {
  item: SubMenuProps;
  collapsed: boolean;
}

export default function FcSubMenu(props: Props) {
  const { item, collapsed } = props;
  const { activeMode } = useContext(Context);
  const [menuSelect, setMenuSelect] = useMenuSelect();
  const [menuActive, setMenuActive] = useMenuActive();
  const [collapse, setCollapse] = useState(false);
  const selected = menuSelect.includes(item.key) && menuSelect.length > 1;
  const showHoverModeSelected = menuActive.length > 0 ? menuActive.includes(item.key) : selected;
  useEffect(() => {
    if (collapsed) {
      setCollapse(selected);
    }
  }, [menuSelect, collapsed]);

  const menu = (
    <Menu onClick={({ key }) => setMenuSelect([item.key, key])}>
      {item.children
        .filter((i) => !!i)
        .map((item) => (
          <Menu.Item key={item.key}>{item.label}</Menu.Item>
        ))}
    </Menu>
  );
  return (
    <div
      className={classNames({
        'fc-menu-sub': true,
        'fc-menu-sub-open': collapse,
        'fc-menu-sub-selected': activeMode === 'hover' ? showHoverModeSelected : selected, //hover和click交互不同，click可以有多个选中，而hover只有一个选中
      })}
      onMouseEnter={() => {
        if (activeMode === 'hover') {
          setCollapse(true);
          setMenuActive([item.key]);
        }
      }}
      onMouseLeave={() => {
        if (activeMode === 'hover') {
          setCollapse(false);
        }
      }}
    >
      {(collapse || (activeMode === 'hover' ? showHoverModeSelected : selected)) && (
        <>
          <div className='fc-menu-sub-top'></div>
          <div className='fc-menu-sub-topleft-corner'></div>
          <div className='fc-menu-sub-bottomleft-corner'></div>
          <div className='fc-menu-sub-left'></div>
          <div className='fc-menu-sub-bottom'></div>
        </>
      )}
      <div
        className='fc-menu-sub-title'
        onClick={() => {
          if (activeMode === 'click') {
            if (!collapsed) {
              setCollapse(!collapse);
            }
          }
        }}
        onMouseEnter={() => {
          if (activeMode === 'hover') {
            setMenuActive([item.key]);
          }
        }}
      >
        {collapsed ? (
          <Tooltip title={menu} placement='right' color='white' overlayClassName='fc-menu-sub-tooltip'>
            <span className='fc-menu-sub-title-icon'>{item.icon}</span>
          </Tooltip>
        ) : (
          <span className='fc-menu-sub-title-icon'>{item.icon}</span>
        )}
        {!collapsed && <span className='fc-menu-sub-title-label'>{item.label}</span>}
      </div>

      {activeMode === 'click' && !collapsed && collapse && item.children.filter((i) => !!i).map((i) => <Item key={i.key} item={i} subMenuKey={item.key} collapsed={collapsed} />)}

      {activeMode === 'hover' &&
        !collapsed &&
        (collapse || showHoverModeSelected) &&
        item.children.filter((i) => !!i).map((i) => <Item key={i.key} item={i} subMenuKey={item.key} collapsed={collapsed} />)}
    </div>
  );
}
