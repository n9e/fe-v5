import React from 'react';
import { Link } from 'react-router-dom';
import { Space, Row, Col } from 'antd';
import IconFont from '@/components/IconFont';
import { OverInterface } from '@/store/overview';
import { useTranslation } from 'react-i18next';

const Statistics: React.FC<OverInterface> = (props: OverInterface) => {
  const { t } = useTranslation();
  const { list } = props;
  return (
    <div className='statistics_con'>
      <Row justify='space-around'>
        {list?.map((item, index) => (
          <Col key={index}>
            <Link to={item?.url}>
              <Space align='center'>
                <IconFont
                  type={item?.icon}
                  className='statistics_icon'
                  style={{
                    fontSize: '48px',
                  }}
                ></IconFont>
                <div>
                  <p className='name'>{item?.name}</p>
                  <p>
                    <span className='num'>{item?.num}</span>
                    <span className='unit'>{t('个')}</span>
                  </p>
                </div>
              </Space>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Statistics;
