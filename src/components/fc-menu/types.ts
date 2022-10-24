export interface MenuItemProps {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SubMenuProps extends MenuItemProps {
  children: MenuItemProps[];
}

export type IMenuProps = MenuItemProps | SubMenuProps | undefined;

export const isSubMenu = (menu: IMenuProps): boolean => {
  if (menu && menu['children']) {
    return true;
  } else {
    return false;
  }
};
