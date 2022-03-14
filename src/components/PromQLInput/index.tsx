import React, { FC, useEffect, useRef } from 'react';

import { EditorView, highlightSpecialChars, keymap, ViewUpdate, placeholder } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { indentOnInput } from '@codemirror/language';
import { history, historyKeymap } from '@codemirror/history';
import { defaultKeymap, insertNewlineAndIndent } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets';
import { highlightSelectionMatches } from '@codemirror/search';
import { commentKeymap } from '@codemirror/comment';
import { lintKeymap } from '@codemirror/lint';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { PromQLExtension } from 'codemirror-promql';
import { baseTheme, promqlHighlighter } from './CMTheme';

const promqlExtension = new PromQLExtension();

interface CMExpressionInputProps {
  url: string;
  headers?: { [index: string]: string };
  value?: string;
  onChange?: (expr: string) => void;
  executeQuery?: () => void;
}

const ExpressionInput: FC<CMExpressionInputProps> = ({ url, headers, value, onChange, executeQuery }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const executeQueryCallback = useRef(executeQuery);
  const realValue = useRef<string | undefined>(value || '');

  useEffect(() => {
    executeQueryCallback.current = executeQuery;
    promqlExtension
      .activateCompletion(true)
      .activateLinter(true)
      .setComplete({
        remote: {
          url,
          fetchFn: (resource, options = {}) => {
            const params = options.body?.toString();
            const search = params ? `?${params}` : '';
            return fetch(resource + search, {
              method: 'Get',
              headers: headers ? new Headers(headers) : undefined,
            });
          },
        },
      });

    // Create or reconfigure the editor.
    const view = viewRef.current;
    if (view === null) {
      // If the editor does not exist yet, create it.
      if (!containerRef.current) {
        throw new Error('expected CodeMirror container element to exist');
      }

      const startState = EditorState.create({
        doc: value,
        extensions: [
          baseTheme,
          highlightSpecialChars(),
          history(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          highlightSelectionMatches(),
          promqlHighlighter,
          EditorView.lineWrapping,
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...commentKeymap, ...completionKeymap, ...lintKeymap]),
          placeholder('Expression (press Shift+Enter for newlines)'),
          promqlExtension.asExtension(),
          keymap.of([
            {
              key: 'Escape',
              run: (v: EditorView): boolean => {
                v.contentDOM.blur();
                return false;
              },
            },
          ]),
          Prec.override(
            keymap.of([
              {
                key: 'Enter',
                run: (v: EditorView): boolean => {
                  if (typeof executeQueryCallback.current === 'function') {
                    executeQueryCallback.current();
                  }
                  return true;
                },
              },
              {
                key: 'Shift-Enter',
                run: insertNewlineAndIndent,
              },
            ]),
          ),
          EditorView.updateListener.of((update: ViewUpdate): void => {
            if (typeof onChange === 'function') {
              const val = update.state.doc.toString();
              if (val !== realValue.current) {
                realValue.current = val;
                onChange(val);
              }
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: containerRef.current,
      });

      viewRef.current = view;

      // view.focus();
    }
  }, [onChange]);

  useEffect(() => {
    if (realValue.current !== value) {
      realValue.current = value || '';
      const view = viewRef.current;
      if (view === null) {
        return;
      }
      const { from, to } = view.state.selection.ranges[0];
      view.dispatch(
        view.state.update({
          changes: { from, to, insert: value },
        }),
      );
    }
  }, [value]);

  return (
    <div className='ant-input'>
      <div className='input-content' ref={containerRef} />
    </div>
  );
};

export default ExpressionInput;
