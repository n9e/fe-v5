import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import './index.less';
interface IMarkDownPros {
  content: string;
}

// https://github.com/vitejs/vite/issues/3592 bug solve 记录
const Markdown: React.FC<IMarkDownPros> = ({ content }) => (
  <div className='srm-markdown-wrapper'>
    <ReactMarkdown remarkPlugins={[gfm]} children={content} rehypePlugins={[rehypeRaw]} />
  </div>
);

export default Markdown;
