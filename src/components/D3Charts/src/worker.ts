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
import getNearestPoints from './getNearestPoints';
import { Serie } from './interface';

type CacheType = {
  [index: string]: string;
};
type SeriesType = {
  [index: string]: Serie[];
};

const cache: CacheType = {};
const series: SeriesType = {};
const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
  const { data } = event;

  if (data.id) {
    if (!cache[data.id] || !data.flag) {
      cache[data.id] = data.str;
      series[data.id] = JSON.parse(data.str);
    }
  }

  const nearestPoints = getNearestPoints({
    x: data.x,
    xkey: data.xkey,
    ykey: data.ykey,
    y0key: data.y0key,
    timestamp: data.timestamp,
    series: series[data.id],
    fillNull: data.fillNull,
  });

  ctx.postMessage(nearestPoints); // TODO: targetOrigin
});

export default ctx;
