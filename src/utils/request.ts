/** Request 网络请求工具 更详细的 api 文档: https://github.com/umijs/umi-request */
import { extend } from 'umi-request';
import { notification } from 'antd';
import { UpdateAccessToken } from '@/services/login';

/** 异常处理程序，所有的error都被这里处理，页面无法感知具体error */
const errorHandler = (error: Error): Response => {
  // 忽略 AbortError 类型的报错
  // @ts-ignore
  if (!(error.name === 'AbortError') && !error.silence) {
    notification.error({
      message: error.message,
    });
  }
  // @ts-ignore
  if (error.silence) {
    // TODO: 兼容 n9e，暂时认定只有开启 silence 的场景才需要传递 error 详情
    throw error;
  } else {
    throw new Error(error.message);
  }
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
  async (response, options) => {
    const { status } = response;

    if (status === 200) {
      return response
        .clone()
        .json()
        .then((data) => {
          if (response.url.includes('/api/v1/')) {
            if (status === 200 && !data.error) {
              return { ...data, success: true };
            } else if (data.error) {
              // @ts-ignore
              throw new Error(data.error.message, { cause: options.silence });
            }
          } else {
            if (data.err === '' || data.status === 'success' || data.error === '') {
              if (data.data || data.dat) {
                if (data.dat && Object.prototype.toString.call(data.dat.list) === '[object Null]') {
                  data.dat.list = [];
                }
              }
              return { ...data, success: true };
            } else {
              if (options.silence) {
                throw {
                  name: data.err,
                  message: data.err,
                  silence: true,
                  data,
                  response,
                };
              } else {
                throw new Error(data.err);
              }
            }
          }
        });
    }
    // 兼容异常处理
    if (status === 500 && response.url.includes('/api/v1')) {
      return response
        .clone()
        .json()
        .then((data) => {
          if (!data.error) {
            return { ...data, success: true };
            // if (data.data || data.dat) {
            //   return { ...data, success: true };
            // } else {
            //   return { success: true };
            // }
          } else if (data.error) {
            throw {
              name: data.error.name,
              message: data.error.message,
              silence: options.silence,
              data,
              response,
            };
          }
        });
    }
    if (status === 401) {
      if (response.url.indexOf('/api/n9e/auth/refresh') > 0) {
        location.href = `/login${location.pathname != '/' ? '?redirect=' + location.pathname + location.search : ''}`;
      } else {
        localStorage.getItem('refresh_token')
          ? UpdateAccessToken().then((res) => {
              console.log('401 err', res);
              if (res.err) {
                location.href = `/login${location.pathname != '/' ? '?redirect=' + location.pathname + location.search : ''}`;
              } else {
                const { access_token, refresh_token } = res.dat;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
              }
            })
          : (location.href = `/login${location.pathname != '/' ? '?redirect=' + location.pathname + location.search : ''}`);
      }
    } else if (status === 404) {
      location.href = '/404';
    } else if (status === 403 && response.url.includes('/api/v1')) {
      return response
        .clone()
        .json()
        .then((data) => {
          if (data.error && data.error.message) throw new Error(data.error.message);
        });
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
            // 兼容 n9e 中的 prometheus api
            if (options.silence === undefined) {
              if (response.url.indexOf('/api/n9e/prometheus/api/v1') > -1 || response.url.indexOf('/api/v1/datasource/prometheus') > -1) {
                return data;
              }
            }
            if (response.url.includes('/api/v1')) {
              throw {
                // TODO: 后端服务异常后可能返回的错误数据也不是一个正常的结构，后面得考虑下怎么处理
                name: data.error ? data.error.name : JSON.stringify(data),
                message: data.error ? data.error.message : JSON.stringify(data),
                silence: options.silence,
                data,
                response,
              };
            } else {
              throw new Error(data.err ? data.err : data);
            }
          });
      }
    }
  },
  {
    global: false,
  },
);

export default request;
