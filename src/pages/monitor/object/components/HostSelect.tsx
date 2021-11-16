import React, { useEffect, useState } from 'react'
import { Button, Input, Select, Table, Tooltip } from 'antd';

export default (props) => {
  const { allHosts, changeSelectedHosts } = props
  const { Option } = Select
  const [selectedHostsKeys, setSelectedHostsKeys] = useState<string[]>([])
  const columns = [
    { title: '对象标识', dataIndex: 'ident', width: 150 },
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
    }
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
        onChange: (selectedRowKeys: string[], selectedRows) => {
          setSelectedHostsKeys(selectedRowKeys)
          changeSelectedHosts && changeSelectedHosts(selectedRows)
        }
      }}
      columns={columns}
      dataSource={allHosts}></Table>
  </div>
}
