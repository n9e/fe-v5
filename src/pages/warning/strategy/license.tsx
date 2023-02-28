import React, { useEffect, useState } from 'react';
import { Tooltip, Modal } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { getBrainLicense } from '@/services/warning';
import { useTranslation } from 'react-i18next';
export default function License() {
  const { t } = useTranslation();
  const [days, setDays] = useState<any>();
  const [rules, setRules] = useState<any>();
  useEffect(() => {
    const now = moment().unix();
    getBrainLicense()
      .then((res) => {
        setDays(_.round((res?.data?.expire - now) / 86400));
        setRules(res?.data?.rules_remaining);
        window.localStorage.setItem('license_rules_remaining', _.toString(res?.data?.rules_remaining));
      })
      .catch((e) => {
        const modal = Modal.error({
          closable: false,
          maskClosable: false,
          title: t('License证书不存在或已过期，请联系Flashcat技术支持'),
          className: 'license-off',
        });
        setTimeout(() => {
          modal.destroy();
        }, 10000);
      });
  }, []);
  if (!days || days > 30) return null;
  return (
    <div
      style={{
        marginRight: 20,
      }}
    >
      <Tooltip
        title={
          <div>
            <div>
              {t('还剩')}
              {days} {t('天到期')}
            </div>
            {rules > 0 ? (
              <div>
                {t('还可添加')}
                {rules} {t('条规则')}
              </div>
            ) : (
              <div>{t('请尽快联系管理员续费')}</div>
            )}
          </div>
        }
      >
        <div
          style={{
            background: '#EBE8F2',
            borderRadius: 16,
            color: '#6C53B1',
            fontSize: 12,
            padding: '2px 8px',
          }}
        >
          {t('还剩')}
          {days} {t('天到期')}
        </div>
      </Tooltip>
    </div>
  );
}
