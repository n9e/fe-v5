/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import * as d3 from 'd3';
import { Options, EventPosition, Transform } from './interface';

type ResetFuncType = (transform?: Transform) => void;

export default class Zoom {
  options: Options;
  reset: ResetFuncType;
  constructor(userOptions: Options, reset: ResetFuncType, container: HTMLElement, canvas: HTMLCanvasElement) {
    this.options = userOptions;
    this.init(container, canvas);
    this.reset = reset;
  }

  init(container: HTMLElement, canvas: HTMLCanvasElement) {
    const { chart: { id, containerHeight } } = this.options;
    const zoomEle = document.createElement('div');
    const markerEle = document.createElement('div');
    const resetEle = document.createElement('a');
    const resetNode = document.createTextNode('Reset zoom');

    zoomEle.id = `${id}-zoom`;
    zoomEle.className = 'ts-graph-zoom';
    markerEle.id = `${id}-zoom-marker`;
    markerEle.className = 'ts-graph-zoom-marker';
    markerEle.style.height = `${containerHeight}px`;
    resetEle.id = `${id}-zoom-resetBtn`;
    resetEle.className = 'ts-graph-zoom-resetBtn';
    resetEle.appendChild(resetNode);
    zoomEle.appendChild(markerEle);
    zoomEle.appendChild(resetEle);
    container.insertBefore(zoomEle, canvas);
    this.onReset();
  }

  onReset() {
    const { chart: { id } } = this.options;
    const resetEle = document.getElementById(`${id}-zoom-resetBtn`) as HTMLElement;

    resetEle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.reset();
      this.clearResetBtn();
    });
  }

  onZoom(mousedownPos: EventPosition, mouseupPos: EventPosition, cbk: (transform: Transform) => void) {
    const { chart: { width } } = this.options;
    const range = mouseupPos.offsetX - mousedownPos.offsetX;

    if (range) {
      const scale = width / Math.abs(range);
      const startPoint = mouseupPos.offsetX > mousedownPos.offsetX ? mousedownPos.offsetX : mouseupPos.offsetX;
      const transform = d3.zoomIdentity.translate(-startPoint * scale, 0).scale(scale);

      this.drawResetBtn();
      cbk(transform);
    }
  }

  clearMarker() {
    const { chart: { id } } = this.options;
    const markerEle = document.getElementById(`${id}-zoom-marker`) as HTMLElement;

    markerEle.style.display = 'none';
    markerEle.style.width = '0px';
    markerEle.style.left = 'unset';
    markerEle.style.right = 'unset';
  }

  drawMarker(mousedownPos: EventPosition, eventPosition: EventPosition) {
    const { chart: { marginLeft } } = this.options;
    const x1 = mousedownPos.offsetX;
    const x2 = eventPosition.offsetX;
    const { chart: { id, containerWidth } } = this.options;
    const markerEle = document.getElementById(`${id}-zoom-marker`) as HTMLElement;

    markerEle.style.display = 'block';
    markerEle.style.top = '0px';
    if (x1 < x2) {
      markerEle.style.right = 'unset';
      markerEle.style.left = `${x1 + marginLeft}px`;
      markerEle.style.width = `${x2 - x1}px`;
    } else {
      markerEle.style.left = 'unset';
      markerEle.style.right = `${containerWidth - x1 - marginLeft}px`;
      markerEle.style.width = `${x1 - x2}px`;
    }
  }

  clearResetBtn() {
    const { chart: { id } } = this.options;
    const resetEle = document.getElementById(`${id}-zoom-resetBtn`) as HTMLElement;

    resetEle.style.display = 'none';
  }

  drawResetBtn() {
    const { chart: { id } } = this.options;
    const resetEle = document.getElementById(`${id}-zoom-resetBtn`) as HTMLElement;

    resetEle.style.display = 'block';
  }
}
