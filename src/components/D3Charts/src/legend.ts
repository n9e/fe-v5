import { Options } from './interface';

type LegendItemClickFuncType = (name: string) => any;

function findIndex(elem: HTMLElement) {
  let k = -1;
  let e = elem;
  while (e) {
    if ('previousSibling' in e) {
      e = e.previousSibling as HTMLElement;
      k += 1;
    } else {
      k = -1;
      break;
    }
  }
  return k;
}

export default class Legend {
  options: Options;
  onLegendItemClick: LegendItemClickFuncType;
  constructor(userOptions: Options, onLegendItemClick: LegendItemClickFuncType, container: HTMLElement, canvas: HTMLCanvasElement) {
    this.options = userOptions;
    this.init(container, canvas);
    this.onLegendItemClick = onLegendItemClick;
  }

  init(container: HTMLElement, canvas: HTMLCanvasElement) {
    const { chart: { id } } = this.options;
    const legendNode = document.createElement('div');

    legendNode.id = `${id}-legend`;
    legendNode.className = 'ts-graph-legend';
    if (!document.getElementById(legendNode.id)) {
      container.insertBefore(legendNode, canvas);
    }
    this.initEvent();
  }

  initEvent() {
    const { chart: { id } } = this.options;
    const legendNode = document.getElementById(`${id}-legend`) as HTMLElement;
    legendNode.removeEventListener('click', this.handelLegendItemClick);
    legendNode.addEventListener('click', this.handelLegendItemClick);
  }

  updateOptions(newOptions: Options) {
    this.options = newOptions;
  }

  handelLegendItemClick = (e: MouseEvent) => {
    const currentTarget = e.currentTarget as HTMLElement;
    let target = e.target as HTMLElement;
    while (target !== currentTarget) {
      if (target && target.className === 'ts-graph-legend-item') {
        const { series } = this.options;
        const index = findIndex(target);
        this.onLegendItemClick(series[index].name);
      }
      if (target.parentNode) {
        target = target.parentNode as HTMLElement;
      }
    }
  }

  draw() {
    const { chart: { id }, series, legend } = this.options;
    const legendNode = document.getElementById(`${id}-legend`)!;

    if (!legend.enabled) return;
    if (Object.prototype.toString.call(series) === '[object Array]') {
      legendNode.innerHTML = '';
      const frag = document.createDocumentFragment();
      series.forEach((serie) => {
        const legendItemNode = document.createElement('span');
        const symbolNode = document.createElement('span');
        const symbolLineNode = document.createElement('span');
        const symbolPointNode = document.createElement('span');
        const legendTextNode = document.createTextNode(serie.name);

        legendItemNode.className = 'ts-graph-legend-item';
        symbolNode.className = 'ts-graph-legend-item-symbol';
        symbolLineNode.className = 'ts-graph-legend-item-symbol-line';
        symbolLineNode.style.borderColor = serie.color;
        symbolPointNode.className = 'ts-graph-legend-item-symbol-point';
        symbolPointNode.style.backgroundColor = serie.color;
        symbolNode.appendChild(symbolLineNode);
        symbolNode.appendChild(symbolPointNode);
        legendItemNode.appendChild(symbolNode);
        legendItemNode.appendChild(legendTextNode);
        frag.appendChild(legendItemNode);
      });
      legendNode.appendChild(frag);
    }
  }
}
