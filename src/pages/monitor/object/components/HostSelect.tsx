import React, { useEffect, useState } from 'react'
import { Button, Input, Select, Table } from 'antd';

export default (props) => {
  const { allHosts } = props
  const { Option } = Select
  const [selectedHostsKeys, setSelectedHostsKeys] = useState<string[]>([])
  const columns = [
    { title: '对象标识', dataIndex: 'ident' },
    { title: '备注', dataIndex: 'note' },
    { title: '标签', dataIndex: 'tags' }
  ]
  useEffect(() => {
    setSelectedHostsKeys(allHosts.map(h => h.ident))
  }, [allHosts.length])
  const selectBefore = (
    <Select defaultValue="bg" className="select-before">
      <Option value="bg">按业务组筛选</Option>
    </Select>
  )
  return <div className='host-select'>
    <div className='top-bar'>
      <Button>监控对象</Button>
      <Input addonBefore={selectBefore} />
    </div>
    <Table
      className='host-list'
      rowKey='ident'
      rowSelection={{
        selectedRowKeys: selectedHostsKeys,
        onChange: () => {}
      }}
      columns={columns}
      dataSource={allHosts}></Table>
  </div>
}
