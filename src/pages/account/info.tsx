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
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Modal, Row, Col, message, Space, Select, Drawer } from 'antd';
import { getNotifyChannels } from '@/services/manage';
import { RootState, accountStoreState } from '@/store/accountInterface';
import { ContactsItem } from '@/store/manageInterface';
import { MinusCircleOutlined, PlusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import IconFont from '@/components/IconFont';
import ChangePassword from './changePassword';
import AddContact from './AddContact';

const CONTACTS_ICON_MAP = {
  wecom_robot_token: 'Wecom',
  dingtalk_robot_token: 'Dingtalk',
  feishu_robot_token: 'Feishu',
};

const { Option } = Select;
export default function Info() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [contactsList, setContactsList] = useState<ContactsItem[]>([]);
  let { profile } = useSelector<RootState, accountStoreState>((state) => state.account);
  const [selectAvatar, setSelectAvatar] = useState<string>(profile.portrait || '/image/avatar1.png');
  const [customAvatar, setCustomAvatar] = useState('');
  const dispatch = useDispatch();
  const [curEditingCard, setCurEditingCard] = useState<string>('');
  const [pwdDrawerVisible, setPwdDrawerVisible] = useState(false);
  const [contactsDrawerVisible, setContactsDrawerVisible] = useState(false);

  const cardsInfo = useMemo(
    () =>
      [
        {
          title: t('显示名'),
          key: 'nickname',
          value: profile.nickname,
          icon: 'DisplayName',
          editMode: 'current',
        },
        {
          title: t('密码'),
          key: 'password',
          value: '********',
          icon: 'Lock',
          editMode: 'drawer',
          editCallback: () => setPwdDrawerVisible(true),
        },
        {
          title: t('邮箱'),
          key: 'email',
          value: profile.email,
          icon: 'Letter',
          editMode: 'current',
        },
        {
          title: t('手机'),
          key: 'phone',
          value: profile.phone,
          icon: 'Telephone',
          editMode: 'current',
        },
        ...Object.keys(profile.contacts || {})
          .sort()
          .map((key) => {
            let contact = contactsList.find((item) => item.key === key);
            return (
              contact && {
                title: contact.label,
                key: 'contacts.' + contact.key,
                value: profile.contacts[contact.key],
                icon: CONTACTS_ICON_MAP[contact.key],
                editMode: 'current',
              }
            );
          }),
      ].filter((p) => p),
    [profile, contactsList],
  );

  useEffect(() => {
    const { id, nickname, email, phone, contacts, portrait } = profile;
    form.setFieldsValue({
      nickname,
      email,
      phone,
      contacts,
    });

    if (portrait.startsWith('http')) {
      setCustomAvatar(portrait);
    }
  }, [profile]);

  useEffect(() => {
    getNotifyChannels().then((data: Array<ContactsItem>) => {
      setContactsList(data);
    });
  }, []);

  const handleOk = () => {
    if (customAvatar) {
      if (!customAvatar.startsWith('http')) {
        message.error(t('自定义头像需以http开头'));
        return;
      }

      fetch(customAvatar, {
        mode: 'no-cors',
      })
        .then((res) => {
          setIsModalVisible(false);
          updateProfile('portrait', customAvatar);
        })
        .catch((err) => {
          message.error(t('自定义头像') + err);
        });
    } else {
      setIsModalVisible(false);
      updateProfile('portrait', selectAvatar);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const updateProfile = (key: string, value: any) => {
    const updateProfile = { ...profile };

    if (key.includes('contacts.')) {
      const realKey = key.split('contacts.')[1];
      if (!value) {
        delete updateProfile['contacts'][realKey];
      } else {
        updateProfile['contacts'][realKey] = value;
      }
    } else {
      updateProfile[key] = value;
    }

    const promise = dispatch({
      type: 'account/updateProfile',
      data: updateProfile,
    });
    (promise as unknown as (Promise<any>)).then(() => {
      setCurEditingCard('');
      message.success(t('信息保存成功'));
    })
  };

  const avatarList = new Array(8).fill(0).map((_, i) => i + 1);

  const handleImgClick = (i) => {
    setSelectAvatar(`/image/avatar${i}.png`);
  };

  return (
    <div
      className='profile-page'
      onClick={(e) => {
        const name = (e.target as any)?.nodeName?.toLowerCase() || '';
        const className = (e.target as any)?.className;
        if (name !== 'svg' && name !== 'input' && name !== 'use' && !className.includes('edit-icon') && !className.includes('anticon')) {
          setCurEditingCard('');
        }
      }}
    >
      <div className='profile-page-container'>
        <div className='basic-info'>
          <div className='avatar'>
            <img src={profile.portrait || '/image/avatar1.png'} />
            <div className='avatar-btn' onClick={() => setIsModalVisible(true)}>
              {t('更换头像')}
            </div>
          </div>
          <div className='desc'>
            <div className='name'>{`${profile.nickname}（${profile.username}）`}</div>
            <div className='roles'>{profile.roles.join(', ')}</div>
          </div>
        </div>
        <div className='additional-info'>
          <Row gutter={[16, 16]}>
            {cardsInfo.map((item, i) => (
              <Col xs={24} sm={24} md={12} lg={8} xl={6} xxl={6}>
                <div className='additional-info-container' style={{ backgroundPosition: `${(16 * (i + 2)) % 100}% ${(27 * (i + 1)) % 100}%` }}>
                  <div className='info-icon'>
                    <IconFont type={'icon-' + item?.icon} />
                  </div>
                  <div className='info-desc'>
                    <div className='info-desc-header'>{item?.title}</div>
                    <div className='info-desc-content'>
                      {curEditingCard === item?.key ? (
                        <>
                          <Input
                            defaultValue={item.value}
                            onPressEnter={(e) => {
                              updateProfile(item.key, (e.target as any)?.value);
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <div>{item?.value || t('立即设置')}</div>
                          <div
                            className='edit-icon'
                            onClick={() => {
                              if (item?.editMode === 'current') {
                                setCurEditingCard(item.key);
                              } else {
                                (item as any)?.editCallback?.();
                                setCurEditingCard('');
                              }
                            }}
                          >
                            <IconFont type='icon-Editor' />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
            {contactsList.length > Object.keys(profile.contacts).length && (
              <Col xs={24} sm={24} md={12} lg={8} xl={6} xxl={6}>
                <div
                  className='additional-info-container'
                  style={{ backgroundPosition: `${(16 * (cardsInfo.length + 1)) % 100}% ${(27 * cardsInfo.length) % 100}%`, cursor: 'pointer' }}
                  onClick={() => {
                    setContactsDrawerVisible(true);
                  }}
                >
                  <div className='add-more'>
                    <IconFont type='icon-Plus' />
                    {t('新增更多联系方式')}
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </div>

      <Modal title={t('更换头像')} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} wrapClassName='avatar-modal'>
        <div className='avatar-content'>
          {avatarList.map((i) => {
            return (
              <div key={i} className={`/image/avatar${i}.png` === selectAvatar ? 'avatar active' : 'avatar'} onClick={() => handleImgClick(i)}>
                <img src={`/image/avatar${i}.png`} />
              </div>
            );
          })}
        </div>
        <Input addonBefore={<span>{t('头像URL')}:</span>} onChange={(e) => setCustomAvatar(e.target.value)} value={customAvatar} />
      </Modal>

      <ChangePassword visible={pwdDrawerVisible} setVisible={setPwdDrawerVisible} />

      <AddContact visible={contactsDrawerVisible} setVisible={setContactsDrawerVisible} contactsList={contactsList} updateProfile={updateProfile} profile={profile} />
    </div>
  );
}
