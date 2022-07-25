import React from 'react';
import { IPanel } from '../../../types';
import Markdown from '../../../Editor/Components/Markdown';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
}

export default function index(props: IProps) {
  const { values } = props;
  const { custom } = values;
  const { content, textColor, bgColor, textSize, justifyContent, alignItems } = custom;
  return (
    <Markdown
      content={content}
      style={{
        height: '100%',
        fontSize: textSize,
        color: textColor,
        backgroundColor: bgColor,
        display: 'flex',
        justifyContent,
        alignItems,
      }}
    />
  );
}
