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
import _ from 'lodash';
import { IFieldConfig } from './types';

const GAUGE_DEFAULT_MINIMUM = 0;
const GAUGE_DEFAULT_MAXIMUM = 100;

export const getFormattedThresholds = (field: IFieldConfig) => {
  const min = GAUGE_DEFAULT_MINIMUM;
  const max = GAUGE_DEFAULT_MAXIMUM;
  const { steps } = field;
  const sorted = _.sortBy(steps, (item) => {
    return Number(item.value);
  });
  const thresholdsArray = _.map(sorted, ({ value, color, type }, index) => {
    const nextStep = sorted[index + 1];
    return {
      start: value ?? (type === 'base' ? min : max),
      end: nextStep ? nextStep.value : max,
      color,
    };
  });
  return thresholdsArray;
};
