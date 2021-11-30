import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sh';
import 'ace-builds/src-noconflict/theme-monokai';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Editor(props: Props) {
  return (
    <AceEditor
      placeholder="Placeholder Text"
      style={{ width: '100%' }}
      mode="sh"
      theme="monokai"
      name="blah2"
      fontSize={14}
      showPrintMargin={false}
      showGutter
      highlightActiveLine
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
      value={props.value}
      onChange={(newValue) => {
        if (props.onChange) {
          props.onChange(newValue);
        }
      }}
    />
  )
}
