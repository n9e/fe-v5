import React from 'react';

export const sourceMap = [
  {
    logo: <img src={'/logos/prometheus_logo.svg'} alt='' className='prometheus_logo' width='46' />,
    name: 'Prometheus',
  },
  {
    logo: <img src={'/logos/zabbix_logo.svg'} alt='' className='prometheus_logo' width='94' />,
    name: 'Zabbix',
  },
  {
    logo: <img src={'/logos/mysql_logo.svg'} alt='' className='prometheus_logo' width='89' />,
    name: 'MySQL',
  },
  {
    logo: <img src={'/logos/kafka_logo.svg'} alt='' className='prometheus_logo' width='37' />,
    name: 'Kafka',
  },
];

export const sourceLogoMap = {
  oracle: <img src={'/logos/oracle_logo.svg'} alt='' className='prometheus_logo' width='89' height='46' />,
  prometheus: <img src={'/logos/prometheus_logos.png'} alt='' className='prometheus_logo' width='80' />,
  zabbix: <img src={'/logos/zabbix_logo.svg'} alt='' className='prometheus_logo' width='94' />,
  mysql: <img src={'/logos/mysql_logo.svg'} alt='' className='prometheus_logo' width='89' />,
  kafka: <img src={'/logos/kafka_logo.svg'} alt='' className='prometheus_logo' width='37' />,
  elasticsearch: <img src={'/logos/elasticSearch.svg'} alt='' className='prometheus_logo' width='46' />, // 兼容 n9e
  'elasticsearch.logging': <img src={'/logos/elasticSearch.svg'} alt='' className='prometheus_logo' width='46' />,
  'tencent-es.logging': <img src={'/logos/tencet-es.png'} alt='' className='prometheus_logo' width='61' />,
  'aliyun-es.logging': <img src={'/logos/aliyun-es.png'} alt='' className='prometheus_logo' width='61' />,
  'aliyun-sls': <img src={'/logos/aliyun-sls.png'} alt='' className='prometheus_logo' width='46' />,
  'kafka.logging': <img src={'/logos/kafka_logo--simple.png'} alt='' className='prometheus_logo' width='36' />,
  'zipkin.tracing': <img src={'/logos/zipkin_logo.png'} alt='' className='prometheus_logo' width='39' />,
  'jaeger.tracing': <img src={'/logos/jaeger_logo.png'} alt='' className='prometheus_logo' width='40' />,
  'skywalking.tracing': <img src={'/logos/skywalking_logo.png'} alt='' className='prometheus_logo' width='130' />,
  'standard.change': <img src={'/logos/custom_logo.svg'} alt='' className='prometheus_logo' width='41' />,
  'standard.alert': <img src={'/logos/custom_logo.svg'} alt='' className='prometheus_logo' width='41' />,
  'prometheus.alert': <img src={'/logos/prometheus_logo.svg'} alt='' className='prometheus_logo' width='46' />,
  'zabbix.alert': <img src={'/logos/zabbix_logo.svg'} alt='' className='prometheus_logo' width='94' />,
  'n9e.alert': <img src={'/logos/nightingale_logo.svg'} alt='' className='prometheus_logo' width='36' />,
  'open-falcon.alert': <img src={'/logos/open_falcon_logo.png'} alt='' className='prometheus_logo' width='45' />,
  'tencent-cm.alert': <img src={'/logos/腾讯云.png'} alt='' className='prometheus_logo' width='60' />,
  'jira.change': <img src={'/logos/Jira.svg'} alt='' className='prometheus_logo' width='120' />,
};
