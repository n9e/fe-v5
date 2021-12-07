import React, { FC, useState, useEffect, useRef } from 'react';

import { EditorView, highlightSpecialChars, keymap, ViewUpdate, placeholder } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { indentOnInput, syntaxTree } from '@codemirror/language';
import { history, historyKeymap } from '@codemirror/history';
import { defaultKeymap, insertNewlineAndIndent } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets';
import { highlightSelectionMatches } from '@codemirror/search';
import { commentKeymap } from '@codemirror/comment';
import { lintKeymap } from '@codemirror/lint';
import { autocompletion, completionKeymap, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { baseTheme, promqlHighlighter } from '@/components/PromqlEditor/CMTheme';

import { CompleteStrategy, PromQLExtension } from 'codemirror-promql';
import { newCompleteStrategy } from 'codemirror-promql/cjs/complete';
import { GlobalOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import MetricsExplorer from './metricsExplorer';

const url = '/api/n9e/prometheus';
function myHTTPClient(resource: string): Promise<Response> {
  return fetch(resource, {
    method: 'Get',
    headers: new Headers({
      'X-Cluster': localStorage.getItem('curCluster') || '',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
    }),
  });
}

const promqlExtension = new PromQLExtension();

interface CMExpressionInputProps {
  value: string;
  onExpressionChange: (expr: string) => void;
  queryHistory: string[];
  metricNames: string[];
  isLoading: boolean;
  executeQuery: () => void;
}

// Autocompletion strategy that wraps the main one and enriches
// it with past query items.
export class HistoryCompleteStrategy implements CompleteStrategy {
  private complete: CompleteStrategy;
  private queryHistory: string[];
  constructor(complete: CompleteStrategy, queryHistory: string[]) {
    this.complete = complete;
    this.queryHistory = queryHistory;
  }

  promQL(context: CompletionContext): Promise<CompletionResult | null> | CompletionResult | null {
    return Promise.resolve(this.complete.promQL(context)).then((res) => {
      const { state, pos } = context;
      const tree = syntaxTree(state).resolve(pos, -1);
      const start = res != null ? res.from : tree.from;

      if (start !== 0) {
        return res;
      }

      const historyItems: CompletionResult = {
        from: start,
        to: pos,
        options: this.queryHistory.map((q) => ({
          label: q.length < 80 ? q : q.slice(0, 76).concat('...'),
          detail: 'past query',
          apply: q,
          info: q.length < 80 ? undefined : q,
        })),
        span: /^[a-zA-Z0-9_:]+$/,
      };

      if (res !== null) {
        historyItems.options = historyItems.options.concat(res.options);
      }
      return historyItems;
    });
  }
}

const ExpressionInput: FC<CMExpressionInputProps> = ({ value, onExpressionChange, queryHistory, metricNames, isLoading, executeQuery }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const executeQueryCallback = useRef(executeQuery);
  const [showMetricsExplorer, setShowMetricsExplorer] = useState<boolean>(false);

  useEffect(() => {
    executeQueryCallback.current = executeQuery;
    promqlExtension
      .activateCompletion(true)
      .activateLinter(true)
      .setComplete({
        // completeStrategy: new HistoryCompleteStrategy(
        //   newCompleteStrategy({
        //     remote: { url, fetchFn: myHTTPClient, cache: { initialMetricList: metricNames } },
        //   }),
        //   queryHistory,
        // ),
        remote: { url, fetchFn: myHTTPClient, cache: { initialMetricList: metricNames } },
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
          // This keymap is added without precedence so that closing the autocomplete dropdown
          // via Escape works without blurring the editor.
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
                  executeQueryCallback.current();
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
            onExpressionChange(update.state.doc.toString());
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: containerRef.current,
      });

      viewRef.current = view;

      view.focus();
    }
  }, [executeQuery, onExpressionChange, queryHistory]);

  const insertAtCursor = (value: string) => {
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
  };

  return (
    <>
      <div className='prometheus-input-box'>
        <div className='input-prefix'>
          <span>PromQL: </span>
        </div>
        <div className='input'>
          <div className='input-content' ref={containerRef} />
        </div>
        <div className='suffix'>
          <Button size='large' className='metrics' icon={<GlobalOutlined />} onClick={() => setShowMetricsExplorer(true)}></Button>
          <Button size='large' type='primary' className='execute' onClick={executeQuery}>
            Execute
          </Button>
        </div>
      </div>

      {/* 点击按钮的弹出Modal */}
      <MetricsExplorer show={showMetricsExplorer} updateShow={setShowMetricsExplorer} metrics={metricNames} insertAtCursor={insertAtCursor} />
    </>
  );
};

export default ExpressionInput;
