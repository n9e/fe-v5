import React, { useEffect, useState } from 'react'
import { Button, Input, Select, Table, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SelectedHosts from './SelectedHosts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { BusiGroupItem, CommonStoreState } from '@/store/commonInterface';

export default (props) => {
  const { allHosts, changeSelectedHosts, changeBusiGroup, onSearchHostName } = props
  const { Option } = Select
  const [selectedHostsKeys, setSelectedHostsKeys] = useState<string[]>([])
  const [selectedHosts, setSelectedHosts] = useState<any[]>([])
  const { busiGroups, curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [curBusiItemInHostSelect, setCurBusiItemInHostSelect] = useState(curBusiItem)
  const dispatch = useDispatch()
  const columns = [
    { title: '对象标识', dataIndex: 'ident', render: (t) => <div style={{ maxWidth: '100px' }}>{t}</div> },
    {
      title: '备注',
      dataIndex: 'note',
      render: (t) => <div style={{maxWidth: '100px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}} title={t}>{t}</div>
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (t) => <div style={{maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}} title={t}>{t}</div>
    }
  ]
  useEffect(() => {
    const selectedHosts = allHosts.slice(0, 10)
    setSelectedHostsKeys(selectedHosts.map(h => h.ident))
    setSelectedHosts(selectedHosts)
    changeSelectedHosts && changeSelectedHosts(selectedHosts)
  }, [allHosts.map(h => h.id + '').join('')])
  const selectBefore = (
    <div className='host-add-on'>
      <div className='title'>监控对象</div>
      <div className="select-before">
        <Select value={curBusiItemInHostSelect.id} style={{ width: '100%', textAlign: 'left' }} onChange={(busiItemId) => {
          let data = busiGroups.find(bg => bg.id === busiItemId)
          if (busiItemId !== 0) {
            dispatch({
              type: 'common/saveData',
              prop: 'curBusiItem',
              data: data as BusiGroupItem,
            })
          } else {
            data = {
              id: 0,
              name: '未归组对象'
            } as BusiGroupItem
          }
          changeBusiGroup && changeBusiGroup(data)
          setCurBusiItemInHostSelect(data as BusiGroupItem)
        }}>
          <Option key={0} value={0}>未归组对象</Option>
          {busiGroups.map(bg => <Option key={bg.id} value={bg.id}>{bg.name}</Option>)}
        </Select>
      </div>
      <SearchOutlined style={{position: 'absolute',left: 190, zIndex: 2, top: 9}} />
    </div>
  )
  return <div className='host-select'>
    <div className='top-bar'>
      <Input placeholder='搜索，空格分隔多个关键字' addonBefore={selectBefore} className='host-input' onChange={e => {
        const { value } = e.target;
        onSearchHostName && onSearchHostName(value)
      }} />
    </div>
    <Table
      className={allHosts.length > 0 ? 'host-list' : 'host-list-empty'}
      rowKey='ident'
      rowSelection={{
        selectedRowKeys: selectedHostsKeys,
        onChange: (selectedRowKeys: string[], selectedRows) => {
          setSelectedHostsKeys(selectedRowKeys)
          setSelectedHosts(selectedRows)
          changeSelectedHosts && changeSelectedHosts(selectedRows)
        }
      }}
      columns={columns}
      dataSource={allHosts}
      pagination={{simple: true}}></Table>
    <div style={{marginTop: -44}}>
      <Button type='link' style={{ paddingRight: 4 }} onClick={() => {
        setSelectedHostsKeys(allHosts.map(h => h.ident))
      }}>全选所有</Button>|<SelectedHosts selectedHosts={selectedHosts} allHosts={allHosts} changeSelectedHosts={(selectedHosts) => {
        changeSelectedHosts(selectedHosts)
        setSelectedHosts(selectedHosts)
        setSelectedHostsKeys(selectedHosts.map(sh => sh.ident))
      }}></SelectedHosts>
    </div>
  </div>
}
