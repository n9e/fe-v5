import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { PromQLExtension } from 'codemirror-promql';
import { basicSetup } from '@codemirror/basic-setup';
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';

interface Props {
  style?: object;
  className?: string;
  value?: string;
  onChange?: (expr: string) => void;
}
export default function PromqlEditor(props: Props) {
  const { onChange, value, className, style = {} } = props;
  const [view, setView] = useState<EditorView>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const promQL = new PromQLExtension().setComplete({
      remote: { url: 'http://10.86.76.13:8090' },
    });
    const v = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          promQL.asExtension(),
          EditorView.updateListener.of((update: ViewUpdate): void => {
            onChange?.(update.state.doc.toString());
          }),
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // tslint:disable-next-line:no-non-null-assertion
      parent: containerRef.current!,
    });
    setView(v);
  }, []);
  return (
    <div
      ref={containerRef}
      className={className}
      style={Object.assign({ fontSize: 16 }, style)}
    ></div>
  );
}
