import React, { ReactNode, useEffect } from 'react';
import { Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { IMenuProps, isSubMenu, SubMenuProps } from './types';
import './index.less';
import Item from './menuItem';
import SubMenu from './subMenu';
import createGlobalState from 'react-use/esm/factory/createGlobalState';
import className from 'classnames';
import SkimMenu from './skimMenu';
interface Props {
  items: IMenuProps[];
  onClick: (key: string) => void;
  collapsed: string | null;
  switchCollapsed: () => void;
  defaultSelectedKeys?: string[];
}

export type { IMenuProps };

export const useMenuSelect = createGlobalState<string[]>([]);
export const useMenuActive = createGlobalState<string[]>([]);

export default function FcMenu(props: Props) {
  const { items, onClick, collapsed, switchCollapsed, defaultSelectedKeys } = props;
  const [menuActive, setMenuActive] = useMenuActive();
  const [menuSelect, setMenuSelect] = useMenuSelect();
  useEffect(() => {
    defaultSelectedKeys && setMenuActive(defaultSelectedKeys);
  }, []);
  useEffect(() => {
    if (menuSelect.length > 0) {
      onClick(menuSelect[menuSelect.length - 1]);
    }
  }, [menuSelect]);

  return (
    <div
      className={className({ 'fc-menu': true, collapsed: collapsed === '1', hide: collapsed === '2' })}
      onMouseLeave={() => {
        setMenuActive([]);
      }}
    >
      <div className='collapse-btn'>
        {collapsed === '2' ? (
          <Tooltip title={<SkimMenu items={items} />} placement='rightTop' overlayClassName='fc-skim-menu-tooltip'>
            <MenuFoldOutlined onClick={() => switchCollapsed()} />
          </Tooltip>
        ) : collapsed === '0' ? (
          <MenuFoldOutlined onClick={() => switchCollapsed()} />
        ) : (
          <MenuUnfoldOutlined onClick={() => switchCollapsed()} />
        )}
      </div>
      {collapsed !== '2' &&
        items
          .filter((item) => !!item)
          .map((item) => (isSubMenu(item) ? <SubMenu item={item as SubMenuProps} collapsed={collapsed === '1'} /> : item && <Item item={item} collapsed={collapsed === '1'} />))}
    </div>
  );
}
