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
import { Tag, TagProps } from 'antd';
import { useTranslation } from 'react-i18next';
interface IColorTagProps {
  text: string;
}
const tagColors = ['purple', 'lime', 'green', 'cyan'];

const ColorTag: React.FC<IColorTagProps> = ({ text, ...props }) => {
  const { t } = useTranslation();
  const sumCharCode: number = Array.from(text).reduce<number>((prev: number, item: string) => {
    return prev + item.charCodeAt(0);
  }, 0);
  return (
    <Tag color={'purple'} {...props}>
      {text}
    </Tag>
  );
};

export default ColorTag;
