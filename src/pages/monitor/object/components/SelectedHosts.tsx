import React, { useState } from 'react'
import { Button, Input, Modal, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export default (props) => {
  const { selectedHosts, allHosts, changeSelectedHosts } = props
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: '标识', dataIndex: 'ident', width: 150 },
    {
      title: '备注',
      dataIndex: 'note',
      width: 100,
      render: (t) => <div style={{width: '100px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}} title={t}>{t}</div>
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 200,
      render: (t) => <div style={{width: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}} title={t}>{t}</div>
    },
    {
      title: '操作',
      width: 80,
      render: (t, h) => <Button type="link" block style={{ padding: 0, textAlign: 'left' }} onClick={t => {
        const selectedHostsCopy = [...selectedHosts]
        const shidx = selectedHostsCopy.findIndex(sh => sh === h)
        console.log('shidx', shidx)
        selectedHostsCopy.splice(shidx, 1)
        changeSelectedHosts && changeSelectedHosts(selectedHostsCopy)
      }}>移除</Button>
    }
  ]
  const selectedHostsKeys = selectedHosts.map(sh => sh.ident)
  return <>
    <Button type='link' style={{ paddingLeft: 4 }} onClick={() => {
      showModal()
    }}>已选中（{selectedHostsKeys.length}/{allHosts.length}）</Button>
    <Modal width={800} title={`已选中监控对象（${selectedHostsKeys.length}/${allHosts.length}）`} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Input style={{ width: 200 }} placeholder="搜索标识、标签、备注" prefix={<SearchOutlined />} />
        <Button danger onClick={_ => changeSelectedHosts([])}>清空所有选中的对象</Button>
      </div>
      <Table
        style={{ marginTop: 10 }}
        className='host-list'
        rowKey='ident'
        columns={columns}
        dataSource={selectedHosts}
        pagination={{simple: true}}></Table>
    </Modal>
  </>
}
