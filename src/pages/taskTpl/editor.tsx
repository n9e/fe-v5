import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sh';
import 'ace-builds/src-noconflict/theme-monokai';

interface Props {
  height: string;
  readOnly: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export default function Editor(props: Props) {
  return (
    <AceEditor
      placeholder="Placeholder Text"
      style={{ width: '100%' }}
      height={props.height}
      mode="sh"
      theme="monokai"
      name="blah2"
      fontSize={14}
      showPrintMargin={false}
      showGutter
      readOnly={props.readOnly}
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

Editor.defaultProps = {
  readOnly: false,
  height: '500px',
}
