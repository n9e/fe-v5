import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { BaseParams, Group, Host, App, Item } from './types';

export const getGroups = (data: BaseParams): Promise<Group[]> => {
  return request('/api/n9e-plus/zabbix-groups', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getHosts = (
  data: BaseParams & {
    groupids: string[];
  },
): Promise<Host[]> => {
  return request('/api/n9e-plus/zabbix-hosts', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getApps = (
  data: BaseParams & {
    hostids: string[];
  },
): Promise<App[]> => {
  return request('/api/n9e-plus/zabbix-apps', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getItems = (
  data: BaseParams & {
    group: { filter: string };
    host: { filter: string };
    application: { filter: string };
    item: { filter: string };
    itemtype: 'num' | 'text';
  },
): Promise<Item[]> => {
  return request('/api/n9e-plus/zabbix-filter-items', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};