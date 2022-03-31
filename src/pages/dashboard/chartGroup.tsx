import React, { useState, useEffect, useContext, useCallback, ReactElement, RefObject } from 'react';
import { Button, Collapse, Modal, Menu, Dropdown, Divider, Popover, Checkbox, Tooltip } from 'antd';
import semver from 'semver';
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
const { Panel } = Collapse;
import _ from 'lodash';
import { Group, ChartConfig } from '@/store/dashboardInterface';
import { Tag } from '@/store/chart';
import { getCharts, updateCharts } from '@/services/dashboard';
import { getPerm } from '@/services/common';
import D3Chart from '@/components/D3Chart';
import { SettingOutlined, LinkOutlined, DownOutlined, EditOutlined, CloseCircleOutlined } from '@ant-design/icons';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Range } from '@/components/DateRangePicker';
import { VariableType } from './VariableConfig';
import { number } from 'echarts';
import { useTranslation } from 'react-i18next';
import Graph from '@/components/Graph';
import moment from 'moment';
// 它可以和15行合并为一个import
import { convertExpressionToQuery, replaceExpressionVars } from './VariableConfig/constant';
import Renderer from './Renderer/Renderer/index';

const { confirm } = Modal;
interface Props {
  id: string;
  cluster: string;
  busiId: string;
  groupInfo: Group;
  range: Range;
  refreshFlag: string;
  step: number | null;
  variableConfig: VariableType;
  onAddChart: (data: number) => void;
  onUpdateChart: (group: Group, data: Chart) => void;
  onCloneChart: (group: Group, data: Chart) => void;
  onShareChart: (group: Group, data: Chart) => void;
  onDelChart: (group: Group, data: Chart) => void;
  onDelChartGroup: (id: number) => void;
  onUpdateChartGroup: (group: Group) => void;
  onMoveUpChartGroup: (group: Group) => void;
  onMoveDownChartGroup: (group: Group) => void;
  moveUpEnable: boolean;
  moveDownEnable: boolean;
}
type Layouts = {
  lg: Array<Layout>;
  sm: Array<Layout>;
  md: Array<Layout>;
  xs: Array<Layout>;
  xxs: Array<Layout>;
};
type Layout = {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
};
const unit = 6;
const cols = 24;
const defColItem = 4; //一键规整列数

export interface Chart {
  id: string;
  configs: ChartConfig;
  group_id: number;
  weight: number;
}
const layouts: Layouts = {
  lg: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
  sm: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
  md: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
  xs: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
  xxs: [
    {
      x: 0,
      y: 0,
      w: unit,
      h: unit,
      i: '0',
    },
    {
      x: unit,
      y: 0,
      w: unit,
      h: unit,
      i: '1',
    },
    {
      x: unit * 2,
      y: 0,
      w: unit,
      h: unit,
      i: '2',
    },
  ],
}; // 根据chartConfigModal配置的数据进行展示

export default function ChartGroup(props: Props) {
  const { t } = useTranslation();
  const {
    id,
    cluster,
    busiId,
    groupInfo,
    range,
    step,
    variableConfig,
    onAddChart,
    onUpdateChart,
    onCloneChart,
    onShareChart,
    onDelChartGroup,
    onDelChart,
    onUpdateChartGroup,
    onMoveUpChartGroup,
    onMoveDownChartGroup,
    moveUpEnable,
    moveDownEnable,
  } = props;
  const [chartConfigs, setChartConfigs] = useState<Chart[]>([]);
  const [Refs, setRefs] = useState<RefObject<any>[]>();
  const [layout, setLayout] = useState<Layouts>(layouts); // const [colItem, setColItem] = useState<number>(defColItem);
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    init();
    Refs &&
      Refs.forEach((ref) => {
        const graphInstance = ref.current;
        graphInstance && graphInstance.refresh();
      });
  }, [groupInfo.updateTime, cluster]);

  const init = async () => {
    setMounted(false);
    getCharts(busiId, groupInfo.id).then(async (res) => {
      let charts = res.dat
        ? res.dat.map((item: { configs: string; id: any; weight: any; group_id: number }) => {
            let configs = item.configs ? JSON.parse(item.configs) : {};
            return { id: item.id, configs, weight: item.weight, group_id: item.group_id };
          })
        : [];
      let haveNewChart = false;
      const innerLayout = charts.map((item: { configs: { layout: { i: string } } }, index: string | number) => {
        if (item.configs.layout) {
          // 当Chart被删除后 layout中的i会中断，ResponsiveReactGridLayout会有问题
          item.configs.layout.i = '' + index;
          return item.configs.layout;
        } else {
          haveNewChart = true;
          return getNewItemLayout(
            charts.slice(0, index).map(
              (item: {
                configs: {
                  layout: any;
                };
              }) => item.configs.layout,
            ),
            Number(index),
          );
        }
      });

      if (haveNewChart) {
        const { dat } = await getPerm(busiId, 'rw');
        dat &&
          updateCharts(
            busiId,
            charts.map((item, index) => {
              const { h, w, x, y, i } = innerLayout[index];
              item.configs.layout = { h, w, x, y, i };
              return item;
            }),
          );
      }

      const realLayout: Layouts = { lg: innerLayout, sm: innerLayout, md: innerLayout, xs: innerLayout, xxs: innerLayout };
      setLayout(realLayout);
      setChartConfigs(charts);
      setRefs(new Array(charts.length).fill(0).map((_) => React.createRef()));
      setMounted(true);
    });
  };

  const getNewItemLayout = function (curentLayouts: Array<Layout>, index: number): Layout {
    const w = unit;
    const h = unit / 3;
    const layoutArrayLayoutFillArray = new Array<Array<number>>();
    curentLayouts.forEach((layoutItem) => {
      if (layoutItem) {
        const { w, h, x, y } = layoutItem;
        for (let i = 0; i < h; i++) {
          if (typeof layoutArrayLayoutFillArray[i + y] === 'undefined') {
            layoutArrayLayoutFillArray[i + y] = new Array<number>(cols).fill(0);
          }

          for (let k = 0; k < w; k++) {
            layoutArrayLayoutFillArray[i + y][k + x] = 1;
          }
        }
      }
    });
    let nextLayoutX = -1;
    let nextLayoutY = -1; // 填充空行

    for (let i = 0; i < layoutArrayLayoutFillArray.length; i++) {
      if (typeof layoutArrayLayoutFillArray[i] === 'undefined') {
        layoutArrayLayoutFillArray[i] = new Array<number>(cols).fill(0);
      }
    }

    function isEmpty(i: number, j: number) {
      let flag = true;

      for (let x = i; x < i + w; x++) {
        for (let y = j; y < j + h; y++) {
          if (layoutArrayLayoutFillArray[x] && layoutArrayLayoutFillArray[x][y]) {
            flag = false;
          }
        }
      }

      return flag;
    }

    for (let i = 0; i < layoutArrayLayoutFillArray.length - 1; i++) {
      for (let j = 0; j <= cols - unit; j++) {
        if (isEmpty(i, j)) {
          nextLayoutY = i;
          nextLayoutX = j;
          break;
        }
      }
    }

    if (nextLayoutX === -1) {
      nextLayoutX = 0;
      nextLayoutY = layoutArrayLayoutFillArray.length;
    }

    return { w, h, x: nextLayoutX, y: nextLayoutY, i: '' + index };
  };

  const onLayoutChange = async (val: { h: any; w: any; x: any; y: any; i: any }[]) => {
    if (val.length === 0) return;
    let needUpdate = false;
    const { lg: lgLayout } = layout;

    for (var k = 0; k < val.length; k++) {
      const { h, w, x, y, i } = val[k];
      const { h: oldh, w: oldw, x: oldx, y: oldy, i: oldi } = lgLayout[k];
      if (h !== oldh || w !== oldw || x !== oldx || y !== oldy || i !== oldi) {
        needUpdate = true;
      }
    }
    if (!needUpdate) return;
    let currConfigs = chartConfigs.map((item, index) => {
      const { h, w, x, y, i } = val[index];
      item.configs.layout = { h, w, x, y, i };
      return item;
    });

    // setLayout({ lg: [...layout], sm: [...layout], md: [...layout], xs: [...layout], xxs: [...layout] });

    const { dat } = await getPerm(busiId, 'rw');
    dat && updateCharts(busiId, currConfigs);
  };

  const setArrange = async (colItem: number, w = cols / colItem, h = unit / 3) => {
    setMounted(false);
    let countX = 0;
    let countY = 0;
    const _lg: Layout[] = [];
    [...layout.lg].forEach((ele, index) => {
      let innerObj = { ...ele };

      if (index + 1 > colItem) {
        let c = (index + 1) / colItem;
        countY = Math.trunc(c) * h;
      }

      innerObj.w = w;
      innerObj.h = h;
      innerObj.x = countX;
      innerObj.y = countY;
      countX += innerObj.w;

      if ((index + 1) % colItem === 0) {
        countX = 0;
      }

      _lg.push(innerObj);
    });
    let currConfigs = chartConfigs.map((item, index) => {
      const { h, w, x, y, i } = _lg[index];
      item.configs.layout = { h, w, x, y, i };
      return item;
    });
    const { dat } = await getPerm(busiId, 'rw');
    dat && updateCharts(busiId, currConfigs);
    setLayout({ lg: [..._lg], sm: [..._lg], md: [..._lg], xs: [..._lg], xxs: [..._lg] });
    setChartConfigs(currConfigs);
    setMounted(true);
  };

  function handleMenuClick(e) {
    e.domEvent.stopPropagation();
    setArrange(Number(e.key));
  }

  function menu() {
    const { t } = useTranslation();
    let listArr: ReactElement[] = [];

    for (let i = 1; i <= defColItem; i++) {
      let item = (
        <Menu.Item key={i}>
          {i}
          {t('列')}
        </Menu.Item>
      );
      listArr.push(item);
    }

    return <Menu onClick={handleMenuClick}>{listArr}</Menu>;
  }

  const generateRightButton = () => {
    const { t } = useTranslation();
    return (
      <>
        <Button
          type='link'
          size='small'
          onClick={(event) => {
            event.stopPropagation();
            onAddChart(groupInfo.id);
          }}
        >
          {t('新增图表')}
        </Button>
        <Divider type='vertical' />
        <Dropdown overlay={menu()}>
          <Button
            type='link'
            size='small'
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {t('一键规整')}
            <DownOutlined />
          </Button>
        </Dropdown>
        <Divider type='vertical' />
        <Button
          type='link'
          size='small'
          onClick={(event) => {
            event.stopPropagation();
            onUpdateChartGroup(groupInfo);
          }}
        >
          {t('修改')}
        </Button>
        <Divider type='vertical' />
        <Button
          type='link'
          size='small'
          disabled={!moveUpEnable}
          onClick={(event) => {
            event.stopPropagation();
            onMoveUpChartGroup(groupInfo);
          }}
        >
          {t('上移')}
        </Button>
        <Divider type='vertical' />
        <Button
          type='link'
          size='small'
          disabled={!moveDownEnable}
          onClick={(event) => {
            event.stopPropagation();
            onMoveDownChartGroup(groupInfo);
          }}
        >
          {t('下移')}
        </Button>
        <Divider type='vertical' />
        <Button
          type='link'
          size='small'
          onClick={(event) => {
            event.stopPropagation();
            confirm({
              title: `${t('是否删除分类')}：${groupInfo.name}`,
              onOk: async () => {
                onDelChartGroup(groupInfo.id);
              },

              onCancel() {},
            });
          }}
        >
          {t('删除')}
        </Button>
      </>
    );
  };

  const generateDOM = () => {
    return (
      chartConfigs &&
      chartConfigs.length > 0 &&
      chartConfigs.map((item, i) => {
        let { QL, name, legend, yplotline1, yplotline2, highLevelConfig, version } = item.configs;
        if (semver.valid(version)) {
          // 新版图表配置的版本使用语义化版本规范
          const { type } = item.configs as any;
          return (
            <div
              style={{
                border: '1px solid #e0dee2',
              }}
              key={String(i)}
            >
              <Renderer
                dashboardId={id}
                id={item.id}
                time={range}
                refreshFlag={props.refreshFlag}
                step={step}
                type={type}
                values={item.configs as any}
                variableConfig={variableConfig}
                onCloneClick={() => {
                  onCloneChart(groupInfo, item);
                }}
                onShareClick={() => {
                  onShareChart(groupInfo, item);
                }}
                onEditClick={() => {
                  onUpdateChart(groupInfo, item);
                }}
                onDeleteClick={() => {
                  confirm({
                    title: `${t('是否删除图表')}：${item.configs.name}`,
                    onOk: async () => {
                      onDelChart(groupInfo, item);
                    },
                  });
                }}
              />
            </div>
          );
        }
        const promqls = QL.map((item) =>
          variableConfig && variableConfig.var && variableConfig.var.length ? replaceExpressionVars(item.PromQL, variableConfig, variableConfig.var.length, id) : item.PromQL,
        );
        const legendTitleFormats = QL.map((item) => item.Legend);
        return (
          <div
            style={{
              border: '1px solid #e0dee2',
            }}
            key={String(i)}
          >
            <Graph
              ref={Refs![i]}
              highLevelConfig={highLevelConfig}
              data={{
                yAxis: {
                  plotLines: [
                    {
                      value: yplotline1 ? yplotline1 : undefined,
                      color: 'orange',
                    },
                    {
                      value: yplotline2 ? yplotline2 : undefined,
                      color: 'red',
                    },
                  ],
                },
                legend: legend,
                step,
                range,
                title: (
                  <Tooltip title={name}>
                    <span>{name}</span>
                  </Tooltip>
                ),
                promqls,
                legendTitleFormats,
              }}
              extraRender={(graph) => {
                return (
                  <>
                    <Button
                      type='link'
                      size='small'
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(item.configs.link);
                      }}
                      disabled={!item.configs.link}
                    >
                      <LinkOutlined />
                    </Button>
                    <Button
                      type='link'
                      size='small'
                      onClick={(e) => {
                        e.preventDefault();
                        onUpdateChart(groupInfo, item);
                      }}
                    >
                      <EditOutlined />
                    </Button>

                    <Button
                      type='link'
                      size='small'
                      onClick={(e) => {
                        e.preventDefault();
                        confirm({
                          title: `${t('是否删除图表')}：${item.configs.name}`,
                          onOk: async () => {
                            onDelChart(groupInfo, item);
                          },

                          onCancel() {},
                        });
                      }}
                    >
                      <CloseCircleOutlined />
                    </Button>
                  </>
                );
              }}
            />
          </div>
        );
      })
    );
  };

  const renderCharts = useCallback(() => {
    const { t } = useTranslation();
    return (
      <div
        style={{
          width: '100%',
        }}
      >
        {chartConfigs && chartConfigs.length > 0 ? (
          <ResponsiveReactGridLayout
            cols={{ lg: cols, sm: cols, md: cols, xs: cols, xxs: cols }}
            layouts={layout}
            onLayoutChange={onLayoutChange}
            measureBeforeMount={false}
            useCSSTransforms={false}
            preventCollision={false}
            isBounded={true}
            draggableHandle='.graph-header'
          >
            {generateDOM()}
          </ResponsiveReactGridLayout>
        ) : (
          <p className='empty-group-holder'>Now it is empty</p>
        )}
      </div>
    );
  }, [mounted, groupInfo.updateTime, range, variableConfig, step]);
  return (
    <div className='n9e-dashboard-group'>
      <Collapse defaultActiveKey={['0']}>
        <Panel header={<span className='panel-title'>{groupInfo.name}</span>} key='0' extra={generateRightButton()}>
          {renderCharts()}
        </Panel>
      </Collapse>
    </div>
  );
}
