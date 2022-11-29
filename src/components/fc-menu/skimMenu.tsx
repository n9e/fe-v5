import React, { ReactNode, useState } from 'react';
import { IMenuProps, MenuItemProps, SubMenuProps } from './types';
import './index.less';
import { useMenuSelect } from './index';

interface Props {
  items: IMenuProps[];
}

export default function FcMenuItem(props: Props) {
  const { items } = props;
  const [menuSelect, setMenuSelect] = useMenuSelect();

  const [hoverSecondMenus, setHoverSecondMenus] = useState<SubMenuProps>();

  return (
    <div className={'fc-skim-menu'}>
      <div className='fc-skim-menu-primary'>
        {items
          .filter((item) => !!item)
          .map((item: SubMenuProps) => (
            <div key={item.key} onMouseEnter={() => setHoverSecondMenus(item)} onClick={() => !item.children && setMenuSelect([item.key])}>
              {item.label}
            </div>
          ))}
      </div>
      <div className='fc-skim-menu-secondary'>
        <div className='fc-skim-menu-secondary-wrap'>
          {hoverSecondMenus &&
            hoverSecondMenus.children &&
            hoverSecondMenus.children
              .filter((item) => !!item)
              .map((item: MenuItemProps) => (
                <div key={item.key} onClick={() => setMenuSelect([hoverSecondMenus.key, item.key])}>
                  {item.label}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
