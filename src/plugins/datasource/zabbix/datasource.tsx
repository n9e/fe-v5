import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { Target, DBQueryParams, Serie } from '../../types';
import { getSerieName } from '../../utils';
import { getDBQuery, getLogsQuery } from '../../services';
import { getGroups, getHosts, getItems } from './services';
import { TargetQuery, TargetQueryIDs, TargetQueryText, DBQuery, DBQueryIDs, LogsQuery, Group } from './types';
import { findDefByName } from './components/FunctionsEditor/functions';
import { filterData, extractText } from './utils';

interface IOptions<T> {
  datasourceCate: string;
  datasourceName: string;
  time: IRawTimeRange;
  targets: Omit<Target<T>, 'refId' | 'expr' | 'legendFormat'>[]; // TODO: 排除掉 prometheus 相关的字段以及和查询无关的 refId
}

export async function getGroupsAndFilteredIDs(options: { cate: string; cluster: string; value?: string }) {
  const { cate, cluster, value } = options;
  let data: Group[] = [];
  let filteredIDs: string[] = [];
  try {
    if (cluster) {
      const result = await getGroups({
        cate,
        cluster,
      });
      data = _.unionBy(result, 'name');
      if (value) {
        filteredIDs = _.map(filterData<Group>(data, value), 'groupid');
      }
    }
  } catch (error) {}
  return {
    data,
    filteredIDs,
  };
}

export async function getHostsAndFilteredIDs(options: { cate: string; cluster: string; groupids: string[]; value?: string }) {
  const { cate, cluster, value, groupids } = options;
  let data: any[] = [];
  let filteredIDs: string[] = [];
  try {
    if (cluster) {
      const result = await getHosts({
        cate,
        cluster,
        groupids,
      });
      data = _.unionBy(result, 'name');
      if (value) {
        filteredIDs = _.map(filterData<any>(data, value), 'hostid');
      }
    }
  } catch (error) {}
  return {
    data,
    filteredIDs,
  };
}

export async function getItemsFunc(options: { cate: string; cluster: string; itemType: 'num' | 'text'; group: string; host: string; application: string; item: string }) {
  const { cate, cluster, itemType, group, host, application, item } = options;
  let data: any[] = [];
  try {
    if (cluster) {
      const result = await getItems({
        cate,
        cluster,
        itemtype: itemType,
        group: { filter: group },
        host: { filter: host },
        application: { filter: application },
        item: { filter: item },
      });
      data = _.unionBy(result, 'name');
    }
  } catch (error) {}
  return data;
}

export async function getHistory(options: IOptions<TargetQuery>) {
  const { time, targets, datasourceCate, datasourceName } = options;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchParams: DBQuery[] = [];
  let series: Serie[] = [];

  try {
    if (targets && datasourceName) {
      _.forEach(targets, (target: Target<TargetQuery>) => {
        const query = target.query;
        batchParams.push({
          start,
          end,
          queryType: '0',
          group: query.group,
          host: query.host,
          application: query.application,
          item: query.item,
          options: query.options,
          functions: _.isEmpty(query.functions)
            ? undefined
            : _.map(query.functions, (funcValue) => {
                return {
                  def: findDefByName(funcValue.name),
                  params: funcValue.params,
                };
              }),
        });
      });
      if (_.isEmpty(batchParams)) return series;
      const seriesRes = await getDBQuery<DBQueryParams<DBQuery>>({
        cate: datasourceCate,
        cluster: datasourceName,
        query: batchParams,
      });
      series = _.map(seriesRes, (item) => {
        return {
          id: _.uniqueId('series_'),
          name: getSerieName(item.metric),
          metric: item.metric,
          data: item.values,
        };
      });
      return series;
    }
  } catch (error) {}
  return series;
}

export async function getHistoryByIDs(options: IOptions<TargetQueryIDs>) {
  const { time, targets, datasourceCate, datasourceName } = options;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchParams: DBQueryIDs[] = [];
  let series: Serie[] = [];

  try {
    if (targets && datasourceName) {
      _.forEach(targets, (target: Target<TargetQueryIDs>) => {
        const query = target.query || {};
        batchParams.push({
          start,
          end,
          queryType: '3',
          itemids: query.itemids,
          options: query.options,
          functions: _.isEmpty(query.functions)
            ? undefined
            : _.map(query.functions, (funcValue) => {
                return {
                  def: findDefByName(funcValue.name),
                  params: funcValue.params,
                };
              }),
        });
      });
      if (_.isEmpty(batchParams)) return series;
      const seriesRes = await getDBQuery<DBQueryParams<DBQueryIDs>>({
        cate: datasourceCate,
        cluster: datasourceName,
        query: batchParams,
      });
      series = _.map(seriesRes, (item) => {
        return {
          id: _.uniqueId('series_'),
          name: getSerieName(item.metric),
          metric: item.metric,
          data: item.values,
        };
      });
      return series;
    }
  } catch (error) {}
  return series;
}

export async function getHistoryText(options: IOptions<TargetQueryText>) {
  const { time, targets, datasourceCate, datasourceName } = options;
  const baseParms = { cate: datasourceCate, cluster: datasourceName };
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchParams: LogsQuery[] = [];
  let series: Serie[] = [];

  try {
    let allItems = [];
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const items = await getItemsFunc({
        ...baseParms,
        itemType: target.query?.mode === 'timeseries' ? 'num' : 'text',
        group: target.query.group?.filter,
        host: target.query.host?.filter,
        application: target.query.application?.filter,
        item: target.query.item?.filter || '/.*/',
      });
      target.query.items = items;
      allItems = _.concat(allItems, items);
    }
    const groupedItems = _.groupBy(allItems, 'value_type');
    _.forEach(groupedItems, (items, valueType) => {
      batchParams.push({
        method: 'history.get',
        params: {
          history: valueType,
          itemids: _.map(items, 'itemid'),
          time_from: start,
          time_till: end,
          output: 'extend',
        },
      });
    });

    if (_.isEmpty(batchParams)) return series;
    const res = await getLogsQuery<DBQueryParams<LogsQuery>>({
      cate: datasourceCate,
      cluster: datasourceName,
      query: batchParams,
    });
    const resDat = _.reduce(
      res.list,
      (acc, item) => {
        return _.concat(acc, item);
      },
      [],
    );
    series = _.map(allItems, (item) => {
      const val = _.find(resDat, { itemid: item.itemid })?.value;
      // 根据item找到对应的target，从而找到对应的textFilter
      const target = _.find(targets, (t) => {
        return _.find(t.query.items, { itemid: item.itemid });
      });
      const metric = {
        host: item.hosts?.[0]?.name,
        item: item.name,
        key_: item.key_,
        lastValue: target?.query?.textFilter ? extractText(val, target?.query?.textFilter, target?.query?.useCaptureGroups) : val,
      };
      return {
        id: _.uniqueId('series_'),
        name: getSerieName(_.omit(metric, 'lastValue')),
        metric,
        data: [],
      };
    });
  } catch (error) {}
  return series;
}

export default async function query(options: IOptions<any>) {
  const { datasourceCate, datasourceName, time, targets } = options;
  const base = { datasourceCate, datasourceName, time };
  const series: Serie[] = [];
  const targetsByMode = _.groupBy(targets, (target) => target.query.mode);

  for (const [mode, targets] of Object.entries<any>(targetsByMode)) {
    if (mode === 'timeseries') {
      const targetsBySubMode = _.groupBy(targets, (target) => target.query.subMode);
      for (const [subMode, targets] of Object.entries<any>(targetsBySubMode)) {
        if (subMode === 'metrics') {
          const result = await getHistory({
            ...base,
            targets,
          });
          series.push(...result);
        } else if (subMode === 'itemIDs') {
          const result = await getHistoryByIDs({
            ...base,
            targets,
          });
          series.push(...result);
        }
      }
    } else if (mode === 'text') {
      const result = await getHistoryText({
        ...base,
        targets: targets,
      });
      series.push(...result);
    }
  }

  return series;
}
