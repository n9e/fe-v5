import React from 'react';
import { Tag, TagProps } from 'antd';
import { useTranslation } from 'react-i18next';
interface IColorTagProps {
  text: string;
}
const tagColors = ['blue', 'lime', 'green', 'cyan'];

const ColorTag: React.FC<IColorTagProps> = ({ text, ...props }) => {
  const { t } = useTranslation();
  const sumCharCode: number = Array.from(text).reduce<number>(
    (prev: number, item: string) => {
      return prev + item.charCodeAt(0);
    },
    0,
  );
  return (
    <Tag color={'blue'} {...props}>
      {text}
    </Tag>
  );
};

export default ColorTag;
