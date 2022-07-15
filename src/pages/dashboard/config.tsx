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
import React from 'react';
import Icon from '@ant-design/icons';

export const statHexPalette = ['#634CD9', '#3FC453', '#FF6A00', '#FF656B'];
export const hexPalette = ['#9B5CE6', '#2E85FF', '#55BCAC', '#FAB34F', '#49DBFF', '#E65CCB'];
export const AddPanelSvg = () => (
  <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' width='1em' height='1em'>
    <path
      d='M810.666667 426.666667h-170.666667V128a42.666667 42.666667 0 0 0-42.666667-42.666667H384a42.666667 42.666667 0 0 0-42.666667 42.666667v213.333333H170.666667a42.666667 42.666667 0 0 0-42.666667 42.666667v512a42.666667 42.666667 0 0 0 42.666667 42.666667h640a42.666667 42.666667 0 0 0 42.666666-42.666667V469.333333a42.666667 42.666667 0 0 0-42.666666-42.666666zM341.333333 853.333333H213.333333V426.666667h128v426.666666z m213.333334 0h-128V170.666667h128v682.666666z m213.333333 0h-128v-341.333333h128v341.333333z m170.666667-682.666666h-42.666667V128a42.666667 42.666667 0 1 0-85.333333 0v42.666667h-42.666667a42.666667 42.666667 0 0 0 0 85.333333h42.666667v42.666667a42.666667 42.666667 0 0 0 85.333333 0V256h42.666667a42.666667 42.666667 0 1 0 0-85.333333z'
      fill='currentColor'
    ></path>
  </svg>
);

export const AddPanelIcon = (props) => <Icon component={AddPanelSvg} {...props} className='anticon-addpanel' />;
