import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9EAPI } from '../../config/constant';
import {
  ISearchTagKeyParams,
  ISearchTagValueParams,
} from '@/components/FormComponents/MultipleDynamicSelect/definition';

// 查询tagkey
export const getTagKey = function (data: ISearchTagKeyParams) {
  return request(`/api/n9e/tag-keys`, {
    method: RequestMethod.Post,
    data,
  });
};

// 查询tag value
export const getTagValue = function (data: ISearchTagValueParams) {
  return request(`/api/n9e/tag-values`, {
    method: RequestMethod.Post,
    data,
  });
};

interface DashboardQuery {}
// 大盘列表
export const getDashboard = function (id: number) {
  return request(`/api/n9e/busi-group/${id}/dashboards?`, {
    method: RequestMethod.Get,
  });
};
interface Dashboard {
  name: string;
  tags: string;
  pure?: boolean;
  configs?: string;
}
// 创建大盘
export const createDashboard = function (id: number, data: Dashboard) {
  return request(`/api/n9e/busi-group/${id}/dashboards`, {
    method: RequestMethod.Post,
    data,
  });
};

// 克隆大盘
export const cloneDashboard = function (busiId: number, id: number) {
  return request(`/api/n9e/busi-group/${busiId}/dashboard/${id}/clone`, {
    method: RequestMethod.Post,
  });
};

// 删除大盘
export const removeDashboard = function (id: number) {
  return request(`/api/n9e/dashboard/${id}`, {
    method: RequestMethod.Delete,
  });
};

// 导出大盘
export const exportDashboard = function (ids: number[]) {
  return request(`/api/n9e/dashboards/export`, {
    method: RequestMethod.Post,
    data: { ids },
  });
};

// 导入大盘
export const importDashboard = function (data: any[]) {
  return request(`/api/n9e/dashboards/import`, {
    method: RequestMethod.Post,
    data,
  });
};

// 创建大盘
export const getSingleDashboard = function (id: string | number) {
  return request(`/api/n9e/dashboard/${id}`, {
    method: RequestMethod.Get,
  });
};

// 更新大盘
export const updateSingleDashboard = function (
  busiId: number,
  id: string,
  data: Dashboard,
) {
  return request(`/api/n9e/busi-group/${busiId}/dashboard/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

interface Group {
  id?: number;
  name: string;
  weight: number;
}
// 创建分组
export const createChartGroup = function (id: string, data: Group) {
  return request(`/api/n9e/dashboard/${id}/chart-groups`, {
    method: RequestMethod.Post,
    data,
  });
};

// 获取分组
export const getChartGroup = function (id: string) {
  return request(`/api/n9e/dashboard/${id}/chart-groups`, {
    method: RequestMethod.Get,
  });
};

// 删除分组
export const delChartGroup = function (id: number) {
  return request(`/api/n9e/chart-group/${id}`, {
    method: RequestMethod.Delete,
  });
};

// 更新分组
export const updateChartGroup = function (data: Group[]) {
  return request(`/api/n9e/chart-groups`, {
    method: RequestMethod.Put,
    data,
  });
};

interface Chart {
  configs: string;
  weight: number;
}

// 创建Chart
export const createChart = function (id: number, data: Chart) {
  return request(`/api/n9e/chart-group/${id}/charts`, {
    method: RequestMethod.Post,
    data,
  });
};

// 编辑Chart
export const updateChart = function (chartId: number, data: Chart) {
  return request(`/api/n9e/chart/${chartId}`, {
    method: RequestMethod.Put,
    data,
  });
};

// 批量更新Chart
export const updateCharts = function (data: { configs: object }[]) {
  const transformedData = data.map((item) => {
    return { ...item, configs: JSON.stringify(item.configs) };
  });
  return request(`/api/n9e/charts/configs`, {
    method: RequestMethod.Put,
    data: transformedData,
  });
};

// 移动Chart
export const moveChart = function (
  id: string,
  data: { id: number; weight: number; group_id: number }[],
) {
  return request(`/api/n9e/charts/weights`, {
    method: RequestMethod.Put,
    data,
  });
};

// 获取某图表分组下面的所有chart
export const getCharts = function (id: number) {
  return request(`/api/n9e/chart-group/${id}/charts`, {
    method: RequestMethod.Get,
  });
};

// 删除Chart
export const removeChart = function (id: number) {
  return request(`/api/n9e/chart/${id}`, {
    method: RequestMethod.Delete,
  });
};

// 删除Chart
export const checkPromql = function (promql: string) {
  return request(`/api/n9e/check-promql`, {
    method: RequestMethod.Get,
    params: { promql },
  });
};

// 告警策略 or 大盘 内置模版
export const getTemplate = function (type: 'alert_rule' | 'dashboard') {
  return request(`/api/n9e/tpl/list?tpl_type=${type}`, {
    method: RequestMethod.Get,
  });
};

export const getTemplateContent = function (
  type: 'alert_rule' | 'dashboard',
  name: string,
) {
  return request(`/api/n9e/tpl/content?tpl_type=${type}&tpl_name=${name}`, {
    method: RequestMethod.Get,
  });
};
