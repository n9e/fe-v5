import React from 'react';
import { Form, Radio, Slider } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';

export default function GraphStyles() {
  const namePrefix = ['custom'];

  return (
    <Panel header='图表样式'>
      <>
        <Form.Item label='绘制模式' name={[...namePrefix, 'drawStyle']}>
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value='lines'>lines</Radio.Button>
            <Radio.Button value='bars'>bars</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'drawStyle']) !== _.get(curValues, [...namePrefix, 'drawStyle'])}>
          {({ getFieldValue }) => {
            const drawStyle = getFieldValue([...namePrefix, 'drawStyle']);
            if (drawStyle === 'lines' || drawStyle === 'bars') {
              return (
                <>
                  {drawStyle === 'lines' ? (
                    <Form.Item label='线插值' name={[...namePrefix, 'lineInterpolation']}>
                      <Radio.Group buttonStyle='solid'>
                        <Radio.Button value='linear'>linear</Radio.Button>
                        <Radio.Button value='smooth'>smooth</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  ) : null}
                  <Form.Item label='透明度' name={[...namePrefix, 'fillOpacity']}>
                    <Slider min={0} max={1} step={0.01} />
                  </Form.Item>
                </>
              );
            }
            return null;
          }}
        </Form.Item>
        <Form.Item label='堆叠' name={[...namePrefix, 'stack']}>
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value='noraml'>开启</Radio.Button>
            <Radio.Button value='off'>关闭</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </>
    </Panel>
  );
}
