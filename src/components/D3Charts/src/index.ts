import * as d3 from 'd3';
import { assign, merge, debounce, throttle, uniqueId, isEmpty } from 'lodash';
import { addListener, removeListener } from 'resize-detector';
import XAxis from './xAxis';
import YAxis from './yAxis';
import Tooltip from './tooltip';
import Line from './line';
import StackArea from './stackArea';
import Zoom from './zoom';
import Legend from './legend';
import { TsGraphType, Options, EventPosition, Transform, Serie, SerieDataItem, XScales, YScales, ChartType } from './interface';
import { getTouchPosition } from './utils';
import '../assets/style.less';

export default class TsGraph {
  baseSeries!: Serie[];
  options!: Options;
  container!: HTMLElement;
  frontContext!: CanvasRenderingContext2D;
  backContext!: CanvasRenderingContext2D;
  eventCanvas!: HTMLCanvasElement;
  frontCanvas!: HTMLCanvasElement;
  backCanvas!: HTMLCanvasElement;
  xAxis!: XAxis;
  xScales!: XScales;
  yAxis!: YAxis;
  yScales!: YScales;
  chartContent!: Line | StackArea;
  legend!: Legend;
  tooltip!: Tooltip;
  zoom!: Zoom;
  transform!: Transform;
  constructor(userOptions: Options) {
    const defaultOptions = {
      chartType: ChartType.Line,
      ratio: window.devicePixelRatio || 1,
      xkey: 0,
      ykey: 1,
      y0key: 2,
      timestamp: 'x',
      chart: {
        id: uniqueId('ts-graph-'),
        colors: [
          '#3399CC',
          '#CC9933',
          '#9966CC',
          '#66CC66',
          '#CC3333',
          '#99CCCC',
          '#CCCC66',
          '#CC99CC',
          '#99CC99',
          '#CC6666',
          '#336699',
          '#996633',
          '#993399',
          '#339966',
          '#993333',
        ],
        width: userOptions.chart.renderTo.offsetWidth,
        height: userOptions.chart.renderTo.offsetHeight || 350,
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
        marginLeft: 10,
      },
      xAxis: {
        lineColor: '#ccc',
        lineWidth: 1,
        tickLength: 5,
        tickpadding: 5,
        tickColor: '#ccc',
        labels: {
          color: '#999',
          fontSize: 11,
        },
      },
      yAxis: {
        // min: -Infinity,
        // max: Infinity,
        lineColor: '#ccc',
        lineWidth: 1,
        tickLength: 5,
        tickpadding: 5,
        tickColor: '#ccc',
        gridLineColor: '#efefef',
        labels: {
          color: '#999',
          shadowColor: '#fff',
          fontSize: 11,
          style: {
            fontSize: 11,
            color: '#999',
          },
        },
      },
      line: {
        width: 2,
      },
      tooltip: {
        shared: true,
      },
      baseSeries: [],
      series: [],
      legend: {
        align: 'center',
        verticalAlign: 'top',
        enabled: false,
      },
      fillNull: undefined,
      onClick: () => {},
      onZoom: () => {},
    };
    const options = merge({}, defaultOptions, userOptions);

    if (userOptions.chart.marginTop === undefined && options.legend.enabled) {
      options.chart.marginTop = 20;
    }
    this.handleResize = debounce(this.handleResize, 300);
    this.init(options);
  }

  init(options: Options) {
    const { chart } = options;
    this.baseSeries = options.series;
    this.options = options;
    this.options.notDisplayedSeries = [];
    this.options.chart.containerWidth = chart.width;
    this.options.chart.containerHeight = chart.height;
    this.options.chart.width = chart.width - chart.marginLeft - chart.marginRight;
    this.options.chart.height = chart.height - chart.marginTop - chart.marginBottom;
    this.options.chartType === ChartType.Line ? this.initLine() : this.initStackArea();
    this.createContainer();
    this.createCanvas();
    this.initEvent();
    this.initLegend();
    this.initTooltip();
    this.initZoom();
    this.initSeries();
    this.initScales();
    // this.initScales(); // TODO: 同 update
    this.draw();
  }

  clearRect(ctx: CanvasRenderingContext2D) {
    const {
      chart: { containerWidth, containerHeight },
    } = this.options;

    ctx.clearRect(0, 0, containerWidth, containerHeight);
  }

  draw() {
    this.clearRect(this.backContext);
    this.yAxis.drawGridLine(this.yScales);
    this.chartContent.draw(this.xScales, this.yScales);
    this.xAxis.draw(this.xScales);
    this.yAxis.draw(this.yScales);
    this.xAxis.drawPlotLines(this.xScales);
    this.yAxis.drawPlotLines(this.yScales);
    this.legend.draw();
  }

  update(newOptions: Options) {
    /**
     * 更新功能目前还没有想到最优的方案，暂时先根据目前的需求来强定制
     */
    const options = assign({}, this.options, newOptions);

    if (newOptions.series) {
      options.series = newOptions.series;
    }
    this.options = options;
    this.initSeries();
    this.options.chartType === ChartType.Line ? this.initLine() : this.initStackArea();
    this.initTooltip();
    this.initScales();
    // this.initScales(); // TODO: 更新偶尔会出现 colsePath 的情况，但是触发两次 initScales 就不会出现 closePath 情况
    this.legend.updateOptions(options);
    this.draw();
  }

  getSeries() {
    return [...this.options.series];
  }

  initEvent() {
    let mousedownStatus = false;
    let mousedownPos: EventPosition = {} as EventPosition;
    let mouseleavePos: EventPosition;
    let isMouserover = false;
    // eslint-disable-next-line no-underscore-dangle
    const _this = this;
    const handleMouseover = debounce((eventPosition: EventPosition) => {
      if (isMouserover) {
        _this.tooltip.draw(eventPosition, _this.xScales, _this.yScales);
        if (mousedownStatus) {
          _this.zoom.drawMarker(mousedownPos, eventPosition);
        }
      }
    }, 10);
    const handleMouseLeave = throttle(() => {
      _this.tooltip.clear();
    }, 10);
    d3.select(this.eventCanvas)
      .on('mousemove', function mousemove(this: HTMLCanvasElement) {
        isMouserover = true;
        handleMouseover(d3.event);
      })
      .on('mouseleave', function mouseleave(this: HTMLCanvasElement) {
        mouseleavePos = d3.event;
        isMouserover = false;
        handleMouseLeave();
      })
      .on('mousedown', function mousedown(this: HTMLCanvasElement) {
        mousedownStatus = true;
        mousedownPos = d3.event;
      })
      .on('mouseup', function mouseup(this: HTMLCanvasElement) {
        d3.event.stopPropagation();
        const eventPosition = d3.event as EventPosition;
        if (mousedownPos && mousedownPos.offsetX !== eventPosition.offsetX) {
          _this.zoom.clearMarker();
          _this.zoom.onZoom(mousedownPos, eventPosition, (transform: Transform) => {
            _this.handleZoom(transform);
          });
        } else {
          _this.options.onClick(d3.event);
        }
        mousedownStatus = false;
        mousedownPos = {} as EventPosition;
      })
      .on('touchmove', function touchmove(this: HTMLCanvasElement) {
        // canvas的touch事件不能获得offsetX和offsetY，需要计算
        const eventPosition = getTouchPosition(_this.eventCanvas, d3.event) as EventPosition;
        _this.tooltip.draw(eventPosition, _this.xScales, _this.yScales);
        if (mousedownStatus) {
          _this.zoom.drawMarker(mousedownPos, eventPosition);
        }
      })
      .on('touchend', function mouseleave(this: HTMLCanvasElement) {
        mouseleavePos = getTouchPosition(_this.eventCanvas, d3.event) as EventPosition;
        isMouserover = false;
        handleMouseLeave();
      });

    // TODO: removeListener
    window.addEventListener('mouseup', () => {
      if (!isEmpty(mousedownPos)) {
        const eventPosition = mouseleavePos;
        mousedownStatus = false;
        _this.zoom.clearMarker();
        _this.zoom.onZoom(mousedownPos, eventPosition, (transform: Transform) => {
          _this.handleZoom(transform);
        });
        mousedownPos = {} as EventPosition;
      }
    });

    addListener(this.options.chart.renderTo, this.handleResize);
  }

  getZoomedSeries = () => {
    const {
      chart: { renderTo },
      series,
      timestamp,
      xkey,
    } = this.options;
    const renderToWidth = renderTo.offsetWidth;
    return series.map((serie) => {
      if (Object.prototype.toString.call(serie.data) === '[object Array]') {
        const data = serie.data.filter((point) => {
          const xVal = timestamp === 'X' ? point[xkey] * 1000 : point[xkey];
          const x = this.xScales(new Date(xVal));
          return x >= 0 && x <= renderToWidth;
        });
        return {
          ...serie,
          data,
        };
      }
      return serie;
    });
  };

  handleResize = () => {
    const { chart } = this.options;
    const width = chart.renderTo.offsetWidth;
    const height = chart.renderTo.offsetHeight;

    this.options.chart.width = width - chart.marginLeft - chart.marginRight;
    this.options.chart.height = height - chart.marginTop - chart.marginBottom;
    this.options.chart.containerWidth = width;
    this.options.chart.containerHeight = height;
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
    this.retinaScaled(this.backCanvas, 'back');
    this.retinaScaled(this.frontCanvas, 'front');
    this.retinaScaled(this.eventCanvas, 'event');
    this.initScales();
    this.draw();
  };

  handleZoom = (transform?: Transform) => {
    const { ykey, yAxis } = this.options;
    let { series } = this.options;
    if (transform) {
      this.transform = transform;
      this.xScales = transform.rescaleX(this.xScales);
      series = this.getZoomedSeries();
    } else {
      this.transform = undefined;
      this.xScales = this.xAxis.init();
    }

    if (Array.isArray(series)) {
      let ymin = yAxis.min || -Infinity;
      let ymax = yAxis.max || Infinity;
      for (const serie of series) {
        const data = Array.isArray(serie.data) ? serie.data : [];
        let dataIdx;
        for (dataIdx = 0; dataIdx < data.length; dataIdx++) {
          const item = data[dataIdx];
          const y = item[ykey];
          if (y === null) continue;
          // get axis domain
          if (ymin < y) {
            ymin = y;
          }
          if (ymax > y) {
            ymax = y;
          }
        }
      }
      this.yAxis.setDomain(this.yScales, { ymin, ymax });
    }
    this.draw();
    this.options.onZoom(this.getZoomedSeries);
  };

  handleLegendItemClick = (serieName: string) => {
    const { notDisplayedSeries } = this.options;

    if (notDisplayedSeries.indexOf(serieName) === -1) {
      notDisplayedSeries.push(serieName);
    } else {
      this.options.notDisplayedSeries = notDisplayedSeries.filter((serie) => {
        return serie !== serieName;
      });
      this.update(this.options);
    }
  };

  retinaScaled(canvas: HTMLCanvasElement, name: string) {
    const { chart, ratio } = this.options;
    const ctx = canvas.getContext('2d')!;
    const width = name === 'front' ? chart.containerWidth : chart.width;
    const height = name === 'front' ? chart.containerHeight : chart.height;
    const left = name === 'front' ? '0px' : `${chart.marginLeft}px`;
    const top = name === 'front' ? '0px' : `${chart.marginTop}px`;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.position = 'absolute';
    canvas.style.left = left;
    canvas.style.top = top;
    if (name === 'front') {
      ctx.translate(chart.marginLeft * ratio, chart.marginTop * ratio);
    }
    ctx.scale(ratio, ratio);
  }

  createContainer() {
    const { chart } = this.options;
    const container = document.createElement('div');

    container.style.position = 'relative';
    container.style.width = `${chart.containerWidth}px`;
    container.style.height = `${chart.containerHeight}px`;
    container.style.overflow = 'hidden';
    chart.renderTo.appendChild(container);
    this.container = container;
  }

  createCanvas() {
    const {
      chart: { id },
    } = this.options;

    function create(this: TsGraphType, name: string) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.setAttribute('id', `${id}-${name}Canvas`);
      this.container.appendChild(canvas);
      this[`${name}Canvas`] = canvas;
      this[`${name}Context`] = context;
      this.retinaScaled(canvas, name);
    }
    create.call(this, 'back');
    create.call(this, 'front');
    create.call(this, 'event');
  }

  initSeries() {
    const { chartType, fillNull, series, xkey, ykey, y0key: y0keyNum, yAxis } = this.options;

    let xmin = -Infinity;
    let xmax = Infinity;
    let ymin = yAxis.min;
    let ymax = yAxis.max;

    if (Array.isArray(series)) {
      const y0key = Number(y0keyNum);
      const newSeries: Serie[] = [];
      const seriesArr = Object.values(series);
      // 复制坐标点，以防影响源 series 对象中的数据
      const clonedSeriesData = seriesArr.map((serie) => {
        return JSON.parse(JSON.stringify(serie.data));
      });
      clonedSeriesData.forEach((serieData, i) => {
        const data = [...(Array.isArray(serieData) ? serieData : [])];
        const newData: SerieDataItem[] = [];
        let flag = false; // 起始标记，后面有连续空值即丢掉
        let dataIdx;
        for (dataIdx = 0; dataIdx < data.length; dataIdx++) {
          const item = data[dataIdx];

          if (chartType === ChartType.StackArea) {
            // 当类型为堆叠图时，y0 和 y 分别代表该 serie 的下标和上标，需要对数据进行处理
            // 第一条 serie，进行特殊处理
            if (i === 0) {
              // 设置第一条 serie 的下标为 0
              item[y0key] = 0;
              if (!item[y0key + 1]) {
                // 保存默认的上标值
                item[y0key + 1] = item[ykey];
              } else {
                // 这种情况表示在 series 列表中选中了某几条 series 进行展示，需要把第一条 serie 的上标值恢复为默认的上标值
                item[ykey] = item[y0key + 1];
              }
            } else {
              // while一直往上找到相同时间戳的点  该点的上标作为当前 serie 点的下标
              let previousYValue = 0;
              let previousI = i;
              while (previousI > 0) {
                if (clonedSeriesData[previousI - 1]) {
                  const sameTimePoint = clonedSeriesData[previousI - 1].find((i) => i[xkey] === item[0]);
                  if (sameTimePoint) {
                    previousYValue = sameTimePoint[ykey];
                    break;
                  }
                }
                previousI--;
              }

              item[y0key] = previousYValue;

              // 将默认的上标值（未叠加）保存，用于之后判断上标值是否进行叠加
              if (!item[y0key + 1]) {
                item[y0key + 1] = item[ykey];
              }

              // 将 serie 的上标值进行叠加，获得实际需要的上标值
              item[ykey] = previousYValue + item[y0key + 1];
            }
          }

          const x = item[xkey];
          const y = item[ykey];

          // filter is invalid points
          if (fillNull === undefined) {
            if (dataIdx === 0 || dataIdx === data.length - 1 || (dataIdx > 0 && dataIdx < data.length - 1 && typeof y === 'number')) {
              newData.push(item);
              flag = true;
            } else if (flag) {
              newData.push(item);
              flag = false;
            }
          } else {
            newData.push(item);
          }

          // get axis domain
          if (xmin < x) {
            xmin = x;
          }
          if (xmax > x) {
            xmax = x;
          }
          if (typeof y === 'number') {
            if (typeof ymin !== 'number' || y < ymin) {
              ymin = y;
            }
            if (typeof ymax !== 'number' || y > ymax) {
              ymax = y;
            }
          } else if (typeof fillNull === 'number') {
            if (fillNull < ymin) {
              ymin = fillNull;
            }
            if (fillNull > ymax) {
              ymax = fillNull;
            }
          }
        }
        newSeries.push({
          ...seriesArr[i],
          data: newData,
        });
      });
      // TODO: 这里不能直接 set，应该保留用户的 options
      // this.options.series = newSeries;
      this.baseSeries = newSeries;
      this.options.xmin = xmin;
      this.options.xmax = xmax;
      this.options.ymin = ymin;
      this.options.ymax = ymax;
    }
  }

  initLine() {
    // TODO: 涉及重复实例导
    this.chartContent = new Line(Object.assign(this.options, { series: this.baseSeries }), this.backContext);
  }

  initStackArea() {
    this.chartContent = new StackArea(Object.assign(this.options, { series: this.baseSeries }), this.backContext);
  }

  initTooltip() {
    // TODO: 涉及重复实例导
    this.tooltip = new Tooltip(this.options, this.frontContext, this.container, this.eventCanvas);
  }

  initZoom() {
    this.zoom = new Zoom(this.options, this.handleZoom, this.container, this.eventCanvas);
  }

  initLegend() {
    this.legend = new Legend(this.options, this.handleLegendItemClick, this.container, this.eventCanvas);
  }

  initScales() {
    // TODO: 涉及重复实例导
    const xAxis = new XAxis(this.options, this.backContext);
    const yAxis = new YAxis(this.options, this.backContext);

    this.xAxis = xAxis;
    let xScales = xAxis.init();
    if (this.transform) {
      xScales = this.transform.rescaleX(xScales);
    }
    this.xScales = xScales;
    this.yAxis = yAxis;
    this.yScales = yAxis.init();
  }

  destroy() {
    this.tooltip.destroy();
    d3.select(this.eventCanvas).on('mousemove', null).on('mouseleave', null).on('mousedown', null).on('mouseup', null).on('touchmove', null);
    d3.select(this.container).remove();
    removeListener(this.options.chart.renderTo, this.handleResize);
  }
}
