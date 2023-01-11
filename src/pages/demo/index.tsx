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
import React, { useState } from 'react';
import { Collapse, Row } from 'antd';
import moment from 'moment';
import PromQueryBuilder, { renderQuery, buildPromVisualQueryFromPromQL } from '@/components/PromQueryBuilder';

const { Panel } = Collapse;

export default function Demo() {
  const [query, setQuery] = useState({
    labels: [
      {
        label: '',
        value: '',
        op: '=',
      },
    ] as any,
    operations: [] as any,
  });
  return (
    <div>
      <Collapse defaultActiveKey='1'>
        <Panel header='Prom query builder' key='1'>
          <Row style={{ marginBottom: 20 }}>
            <PromQueryBuilder
              datasourceValue='VM1'
              params={{
                start: moment().subtract(1, 'hours').unix(),
                end: moment().unix(),
              }}
              value={query}
              onChange={(val) => {
                const promql = renderQuery(val);
                const query = buildPromVisualQueryFromPromQL(promql);
                console.log(val.operations, query.query.operations);
                setQuery(val);
              }}
            />
          </Row>
        </Panel>
      </Collapse>
    </div>
  );
}
