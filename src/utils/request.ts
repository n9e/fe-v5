/** Request 网络请求工具 更详细的 api 文档: https://github.com/umijs/umi-request */
import { extend } from 'umi-request';
import { notification } from 'antd';
import { UpdateAccessToken } from '@/services/login';

/** 异常处理程序，所有的error都被这里处理，页面无法感知具体error */
const errorHandler = (error: Error): Response => {
  // 忽略 AbortError 类型的报错
  if (!(error.name === 'AbortError')) {
    notification.error({
      message: error.message,
    });
  }
  throw new Error();
};

/** 配置request请求时的默认参数 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
});

request.interceptors.request.use((url, options) => {
  let headers = {
    ...options.headers,
  };
  headers['Authorization'] = `Bearer ${localStorage.getItem('access_token') || ''}`;
  if (!headers['X-Cluster']) {
    headers['X-Cluster'] = localStorage.getItem('curCluster') || '';
  }
  headers['X-Language'] = 'zh';
  return {
    url,
    options: { ...options, headers },
  };
});

/**
 * 响应拦截
 */
request.interceptors.response.use(
  async (response) => {
    const { status } = response;

    if (status === 200) {
      return response
        .clone()
        .json()
        .then((data) => {
          if (data.err === '' || data.status === 'success') {
            if (data.data || data.dat) {
              if (data.dat && Object.prototype.toString.call(data.dat.list) === '[object Null]') {
                data.dat.list = [];
              }
            }
            return { ...data, success: true };
          } else {
            throw new Error(data.err);
          }
        });
    }
    if (status === 401) {
      if (response.url.indexOf('/api/n9e/auth/refresh')) {
        location.href = `/login${location.pathname != '/' ? '?redirect=' + location.pathname : ''}`;
      } else {
        localStorage.getItem('refresh_token')
          ? UpdateAccessToken().then((res) => {
              console.log('401 err', res);
              if (res.err) {
                location.href = `/login${location.pathname != '/' ? '?redirect=' + location.pathname : ''}`;
              } else {
                const { access_token, refresh_token } = res.dat;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
              }
            })
          : (location.href = `/login${location.pathname != '/' ? '?redirect=' + location.pathname : ''}`);
      }
    } else if (status === 404) {
      location.href = '/404';
    } else {
      const contentType = response.headers.get('content-type');
      const isPlainText = contentType?.indexOf('text/plain; charset=utf-8') !== -1;
      if (isPlainText) {
        return response
          .clone()
          .text()
          .then((data) => {
            throw new Error(data);
          });
      } else {
        return response
          .clone()
          .json()
          .then((data) => {
            if (response.url.indexOf('/api/n9e/prometheus/api/v1') > -1) {
              return data;
            }
            throw new Error(data.err ? data.err : data);
          });
      }
    }
  },
  {
    global: false,
  },
);

export default request;
