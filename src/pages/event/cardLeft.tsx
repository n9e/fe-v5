import React, { useEffect, useState } from 'react';
import { Button, Input, Form, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusSquareOutlined, SearchOutlined } from '@ant-design/icons';
import { getAggrAlerts, AddAggrAlerts, updateAggrAlerts, deleteAggrAlerts } from '@/services/warning';
import './index.less';
interface Props {
  onRefreshRule: (rule: string) => void;
}

export interface CardAlertType {
  id: number;
  name: string;
  rule: string;
  cate: number;
  create_at: number;
  create_by: number;
  update_at: number;
}

export default function CardLeft(props: Props) {
  const { onRefreshRule } = props;
  const [form] = Form.useForm();
  const [alertList, setAlertList] = useState<CardAlertType[]>();
  const [visible, setVisible] = useState(false);
  const [editForm, setEditForm] = useState<CardAlertType>();
  const localSelectId = localStorage.getItem('selectedAlertRule');
  const [activeId, setActiveId] = useState<number>(localSelectId ? Number(localSelectId) : 0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getList(true);
  }, []);

  useEffect(() => {
    if (activeId && alertList && alertList.length > 0) {
      const currentAlert = alertList?.find((item) => item.id === activeId) as CardAlertType;
      if (currentAlert) {
        onRefreshRule(currentAlert.rule);
      } else {
        saveActiveId(alertList[0].id);
      }
    }
  }, [activeId]);

  function saveActiveId(id: number) {
    if (!id) return;
    setActiveId(id);
    localStorage.setItem('selectedAlertRule', String(id));
  }

  const getList = (selectTheFirst = false) => {
    return getAggrAlerts().then((res) => {
      const sortedList = res.dat.sort((a: CardAlertType, b: CardAlertType) => a.cate - b.cate);
      setAlertList(sortedList);
      selectTheFirst && sortedList.length > 0 && !sortedList.find((item) => item.id === activeId) && saveActiveId(sortedList[0].id);
    });
  };

  const handleOk = async () => {
    await form.validateFields();
    const func = editForm ? updateAggrAlerts : AddAggrAlerts;
    const cur = await func(form.getFieldsValue());
    setVisible(false);
    await getList();
    saveActiveId(editForm ? editForm.id : cur.dat.id);
  };

  const handleCancel = () => {
    setVisible(false);
    setEditForm(undefined);
  };

  const handleDelete = (alert) => {
    Modal.confirm({
      title: `确定要删除聚合策略 ${alert.name} 吗？`,
      onOk: async () => {
        await deleteAggrAlerts([alert.id]);
        message.success('删除成功');
        getList(true);
      },
      onCancel: () => {},
    });
  };

  return (
    <div className='left-area' style={{ width: 240, background: '#fff' }}>
      <div className='page-title'>
        <span>聚合规则</span>
        <a onClick={() => setVisible(true)}>
          <PlusSquareOutlined />
        </a>
      </div>
      <Input
        style={{ margin: '10px 0' }}
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      {alertList
        ?.filter((alert) => alert.name.includes(search))
        .map((alert) => (
          <div className={alert.id === activeId ? 'card-menu-item is-active' : 'card-menu-item'} onClick={() => saveActiveId(alert.id)} key={alert.id}>
            <div className='label-area'>
              <div className='title'>{alert.name}</div>
              {/* <div className='desc'>{alert.rule}</div> */}
            </div>

            {alert.cate === 0 ? (
              <div className='default-holder'>内置</div>
            ) : (
              <div className='icon-area'>
                <EditOutlined
                  onClick={() => {
                    setEditForm(alert);
                    setVisible(true);
                    form.setFieldsValue(alert);
                  }}
                />
                <DeleteOutlined
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(alert);
                  }}
                />
              </div>
            )}
          </div>
        ))}

      <Modal title={(editForm ? '编辑' : '新增') + '聚合规则'} visible={visible} onOk={handleOk} onCancel={handleCancel} destroyOnClose>
        <Form form={form} layout='vertical' preserve={false}>
          <Form.Item
            label='Name'
            name='name'
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value.length === 0) {
                    return Promise.reject(new Error('请输入聚合规则名称'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name='id' hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label='Rule'
            name='rule'
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value.length === 0) {
                    return Promise.reject(new Error('请输入Rule'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            style={{ marginBottom: 5 }}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
