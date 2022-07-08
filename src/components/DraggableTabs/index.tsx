// @ts-nocheck
// https://ant.design/components/tabs-cn/#components-tabs-demo-custom-tab-bar-node
import React, { useRef, cloneElement, ReactNode } from 'react';
import { Tabs, TabsProps } from 'antd';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableTabNode from './DraggableTabNode';
const { TabPane } = Tabs;
// staticKeys 该值不可被移动
class DraggableTabs extends React.Component<TabsProps & { onOrderChange?: (orders: string[]) => void; disableOrder: boolean; staticKeys?: number | string[] }> {
  state = {
    order: [],
  };

  moveTabNode = (dragKey: string, hoverKey) => {
    const newOrder = this.state.order.slice();
    const { children, onOrderChange, disableOrder, staticKeys = [] } = this.props;

    if (disableOrder || staticKeys.includes(dragKey) || staticKeys.includes(hoverKey)) return;
    React.Children.forEach(children, (c) => {
      if (c && newOrder.indexOf(c.key) === -1) {
        newOrder.push(c.key);
      }
    });

    const dragIndex = newOrder.indexOf(dragKey);
    const hoverIndex = newOrder.indexOf(hoverKey);

    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragKey);
    onOrderChange && onOrderChange(newOrder);

    this.setState({
      order: newOrder,
    });
  };

  renderTabBar = (props, DefaultTabBar) => (
    <DefaultTabBar {...props}>
      {(node) => (
        <DraggableTabNode key={node.key} index={node.key} moveNode={this.moveTabNode}>
          {node}
        </DraggableTabNode>
      )}
    </DefaultTabBar>
  );

  render() {
    const { order } = this.state;
    const { children } = this.props;

    const tabs = [];
    React.Children.forEach(children, (c) => {
      if (c) {
        tabs.push(c);
      }
    });

    const orderTabs = tabs.slice().sort((a, b) => {
      const orderA = order.indexOf(a.key);
      const orderB = order.indexOf(b.key);

      if (orderA !== -1 && orderB !== -1) {
        return orderA - orderB;
      }
      if (orderA !== -1) {
        return -1;
      }
      if (orderB !== -1) {
        return 1;
      }

      const ia = tabs.indexOf(a);
      const ib = tabs.indexOf(b);

      return ia - ib;
    });

    return (
      <DndProvider backend={HTML5Backend}>
        <Tabs renderTabBar={this.renderTabBar} {...this.props}>
          {orderTabs}
        </Tabs>
      </DndProvider>
    );
  }
}

export default DraggableTabs;
