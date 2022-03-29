import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import queryString from 'query-string';
import { authCallback } from '@/services/login';

export default function index() {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const [err, setErr] = useState();

  useEffect(() => {
    authCallback({
      code: query.code,
      state: query.state,
      redirect: query.redirect || '/',
    })
      .then((res) => {
        if (res.err === '') {
          if (res.dat) {
            localStorage.setItem('access_token', res.dat.access_token);
            localStorage.setItem('refresh_token', res.dat.refresh_token);
            window.location.href = res.dat.redirect;
          }
        } else {
          setErr(res.err);
        }
      })
      .catch((res) => {
        setErr(res.message);
      });
  }, []);
  if (err === undefined) return null;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        textAlign: 'center',
      }}
    >
      <div>
        <h1>第三方登录验证失败</h1>
        <div style={{ fontSize: 14 }}>{err}</div>
        <div>
          <a href='/login'>返回登录页</a>
        </div>
      </div>
    </div>
  );
}
