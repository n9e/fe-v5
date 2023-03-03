import React, { useEffect, useState } from 'react';
import { Input, Form, Modal, Switch, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusSquareOutlined, SearchOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { getAggrAlerts, AddAggrAlerts, updateAggrAlerts, deleteAggrAlerts } from '@/services/warning';
import { RootState as AccountRootState, accountStoreState } from '@/store/accountInterface';
import './index.less';
import { useTranslation } from "react-i18next";
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
  const {
    t
  } = useTranslation();
  const {
    onRefreshRule
  } = props;
  const [form] = Form.useForm();
  const [alertList, setAlertList] = useState<CardAlertType[]>();
  const [visible, setVisible] = useState(false);
  const [editForm, setEditForm] = useState<CardAlertType>();
  const localSelectId = localStorage.getItem('selectedAlertRule');
  const [activeId, setActiveId] = useState<number>(localSelectId ? Number(localSelectId) : 0);
  const [search, setSearch] = useState('');
  const {
    profile
  } = useSelector<AccountRootState, accountStoreState>(state => state.account);
  useEffect(() => {
    getList(true).then(res => {
      if (activeId && res && res.length > 0) {
        const currentAlert = (res?.find(item => item.id === activeId) as CardAlertType);

        if (currentAlert) {
          onRefreshRule(currentAlert.rule);
        } else {
          saveActiveId(res[0].id);
        }
      }
    });
  }, []);
  useEffect(() => {
    if (activeId && alertList && alertList.length > 0) {
      const currentAlert = (alertList?.find(item => item.id === activeId) as CardAlertType);

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
    return getAggrAlerts().then(res => {
      const sortedList = res.dat.sort((a: CardAlertType, b: CardAlertType) => a.cate - b.cate);
      setAlertList(sortedList);
      selectTheFirst && sortedList.length > 0 && !sortedList.find(item => item.id === activeId) && saveActiveId(sortedList[0].id);
      return sortedList;
    });
  };

  const handleOk = async () => {
    await form.validateFields();
    const func = editForm ? updateAggrAlerts : AddAggrAlerts;
    const values = form.getFieldsValue();
    const cur = await func({ ...values,
      cate: values.cate ? 0 : 1
    });
    setVisible(false);
    await getList();
    saveActiveId(editForm ? editForm.id : cur.dat.id);
    editForm && onRefreshRule(values.rule + ' ');
  };

  const handleCancel = () => {
    setVisible(false);
    setEditForm(undefined);
  };

  const handleDelete = alert => {
    Modal.confirm({
      title: `${t("确定要删除聚合策略 ")}${alert.name}${t(" 吗？")}`,
      onOk: async () => {
        await deleteAggrAlerts([alert.id]);
        message.success(t("删除成功"));
        getList(true);
      },
      onCancel: () => {}
    });
  };

  return <div className='left-area' style={{
    width: 240,
    background: '#fff'
  }}>
      <div className='event-page-title'>
        <span>{t("聚合规则")}</span>
        <a onClick={() => setVisible(true)}>
          <PlusSquareOutlined />
        </a>
      </div>
      <Input style={{
      margin: '10px 0'
    }} prefix={<SearchOutlined />} value={search} onChange={e => {
      setSearch(e.target.value);
    }} />
      {alertList?.filter(alert => alert.name.includes(search)).map(alert => <div className={alert.id === activeId ? 'card-menu-item is-active' : 'card-menu-item'} onClick={() => saveActiveId(alert.id)} key={alert.id}>
            <div className='label-area'>
              <div className='title'>{alert.name}</div>
            </div>

            {alert.cate === 1 || profile.admin ? <div>
                {alert.cate === 0 && <div className='default-holder'>{t("公开")}</div>}
                <div className='icon-area'>
                  <EditOutlined onClick={() => {
            setEditForm(alert);
            setVisible(true);
            form.setFieldsValue({ ...alert,
              cate: alert.cate === 0
            });
            onRefreshRule(alert.rule);
          }} />
                  <DeleteOutlined onClick={e => {
            e.stopPropagation();
            handleDelete(alert);
          }} />
                </div>
              </div> : <div className='default-holder'>{t("公开")}</div>}
          </div>)}

      <Modal title={(editForm ? t("编辑") : t("新增")) + t("聚合规则")} visible={visible} onOk={handleOk} onCancel={handleCancel} destroyOnClose>
        <Form form={form} layout='vertical' preserve={false} initialValues={{
        cate: false
      }}>
          <Form.Item label='Name' name='name' rules={[() => ({
          validator(_, value) {
            if (!value || value.length === 0) {
              return Promise.reject(new Error('请输入聚合规则名称'));
            }

            return Promise.resolve();
          }

        })]}>
            <Input />
          </Form.Item>
          <Form.Item name='id' hidden>
            <Input />
          </Form.Item>
          <Form.Item label='Rule' name='rule' rules={[() => ({
          validator(_, value) {
            if (!value || value.length === 0) {
              return Promise.reject(new Error('请输入Rule'));
            }

            return Promise.resolve();
          }

        })]}>
            <Input />
          </Form.Item>
          {profile.admin && <Form.Item label={t("是否公开")} name='cate' rules={[{
          required: true
        }]} valuePropName='checked'>
              <Switch />
            </Form.Item>}
        </Form>
      </Modal>
    </div>;
}