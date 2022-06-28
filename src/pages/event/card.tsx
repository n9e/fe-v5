import React, { useEffect, useState, useLayoutEffect, useRef, useImperativeHandle } from 'react';
import { Button, Row, Col, Drawer, Tag, Table } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import './index.less';
import CardLeft from './cardLeft';
import { getAlertCards, getCardDetail } from '@/services/warning';
import { throttle } from 'lodash';
import { SeverityColor, deleteAlertEventsModal } from './index';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { ReactNode } from 'react-markdown/lib/react-markdown';
interface Props {
  filter: any;
  header: ReactNode;
}

interface CardType {
  severity: number;
  title: string;
  total: number;
  event_ids: number[];
}

function containerWidthToColumn(width: number): number {
  if (width > 1500) {
    return 4;
  } else if (width > 1000) {
    return 6;
  } else if (width > 850) {
    return 8;
  } else {
    return 12;
  }
}

function Card(props: Props, ref) {
  const { t } = useTranslation();
  const { filter, header } = props;
  const Ref = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const [span, setSpan] = useState<number>(4);
  const [rule, setRule] = useState<string>();
  const [cardList, setCardList] = useState<CardType[]>();
  const [openedCard, setOpenedCard] = useState<CardType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [drawerList, setDrawerList] = useState<any>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    reloadCard();
  }, [filter, rule]);

  const reloadCard = () => {
    if (!rule) return;
    getAlertCards({ ...filter, rule }).then((res) => {
      setCardList(res.dat);
    });
  };

  useLayoutEffect(() => {
    function updateSize() {
      const width = Ref.current?.offsetWidth;
      width && setSpan(containerWidthToColumn(width));
    }
    const debounceNotify = throttle(updateSize, 400);

    window.addEventListener('resize', debounceNotify);
    updateSize();
    return () => window.removeEventListener('resize', debounceNotify);
  }, []);

  const onClose = () => {
    setVisible(false);
  };

  const columns = [
    {
      title: t('集群'),
      dataIndex: 'cluster',
      width: 120,
    },
    {
      title: t('规则标题&事件标签'),
      dataIndex: 'rule_name',
      render(title, { id, tags }) {
        const content =
          tags &&
          tags.map((item) => (
            <Tag color='purple' key={item}>
              {item}
            </Tag>
          ));
        return (
          <>
            <div>
              <a style={{ padding: 0 }} onClick={() => history.push(`/alert-cur-events/${id}`)}>
                {title}
              </a>
            </div>
            <div>
              <span className='event-tags'>{content}</span>
            </div>
          </>
        );
      },
    },
    {
      title: t('触发时间'),
      dataIndex: 'trigger_time',
      width: 120,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('操作'),
      dataIndex: 'operate',
      width: 120,
      render(value, record) {
        return (
          <>
            <Button
              size='small'
              type='link'
              onClick={() => {
                history.push('/alert-mutes/add', {
                  cluster: record.cluster,
                  tags: record.tags
                    ? record.tags.map((tag) => {
                        const [key, value] = tag.split('=');
                        return {
                          func: '==',
                          key,
                          value,
                        };
                      })
                    : [],
                });
              }}
            >
              屏蔽
            </Button>
            <Button
              size='small'
              type='link'
              danger
              onClick={() =>
                deleteAlertEventsModal(undefined, [record.id], () => {
                  setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.id));
                  fetchCardDetail(openedCard!);
                })
              }
            >
              删除
            </Button>
          </>
        );
      },
    },
  ];

  const fetchCardDetail = (card: CardType) => {
    setVisible(true);
    setOpenedCard(card);
    getCardDetail(card.event_ids).then((res) => {
      setDrawerList(res.dat);
    });
  };

  useImperativeHandle(ref, () => ({
    reloadCard,
  }));

  return (
    <div style={{ display: 'flex', height: '100%' }} ref={Ref}>
      <CardLeft onRefreshRule={setRule} />
      <div style={{ background: '#fff', flex: 1, padding: 16 }}>
        {header}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {cardList?.map((card, i) => (
            <Col span={span} key={i}>
              <div className={`event-card ${SeverityColor[card.severity - 1]} ${SeverityColor[card.severity - 1]}-left-border`} onClick={() => fetchCardDetail(card)}>
                <div className='event-card-title'>{card.title}</div>
                <div className='event-card-num'>{card.total}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{openedCard?.title}</span>
            <Button
              danger
              disabled={selectedRowKeys.length === 0}
              onClick={() =>
                deleteAlertEventsModal(undefined, selectedRowKeys, () => {
                  setSelectedRowKeys([]);
                  fetchCardDetail(openedCard!);
                })
              }
            >
              批量删除
            </Button>
          </div>
        }
        placement='right'
        onClose={onClose}
        visible={visible}
        width={960}
      >
        <Table
          rowKey={'id'}
          className='card-event-drawer'
          rowClassName={(record: { severity: number }, index) => {
            return SeverityColor[record.severity - 1] + '-left-border';
          }}
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            onChange(selectedRowKeys, selectedRows) {
              setSelectedRowKeys(selectedRowKeys.map((key) => Number(key)));
            },
          }}
          dataSource={drawerList}
          columns={columns}
        />
      </Drawer>
    </div>
  );
}

export default React.forwardRef(Card);
