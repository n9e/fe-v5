import { JSEncrypt } from 'js-encrypt';/*
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
import { message } from 'antd';
import React, { ReactNode, Component } from 'react';
import { IStore } from '@/store/common';
import { useLocation } from 'react-router-dom';
export const isPromise = (obj) => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

export const download = function (stringList: Array<string> | string, name: string = 'download.txt') {
  const element = document.createElement('a');
  const file = new Blob([Array.isArray(stringList) ? stringList.join('\r\n') : stringList], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = name;
  document.body.appendChild(element);
  element.click();
};

// export const copyToClipBoard = (text: string) => {
//   const input = document.createElement('input');
//   document.body.appendChild(input);
//   input.setAttribute('value', text);
//   input.select();
//   try {
//     if (document.execCommand('Copy')) {
//       message.success('复制到剪贴板');
//     }
//   } catch (error) {
//     message.error('复制失败');
//   }
//   document.body.removeChild(input);
// };

/**
 * 将文本添加到剪贴板
 */
export const copyToClipBoard = (text: string, t, spliter?: string): boolean => {
  const fakeElem = document.createElement('textarea');
  fakeElem.style.border = '0';
  fakeElem.style.padding = '0';
  fakeElem.style.margin = '0';
  fakeElem.style.position = 'absolute';
  fakeElem.style.left = '-9999px';
  const yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElem.style.top = `${yPosition}px`;
  fakeElem.setAttribute('readonly', '');
  fakeElem.value = text;

  document.body.appendChild(fakeElem);
  fakeElem.select();
  let succeeded;
  try {
    succeeded = document.execCommand('copy');
    if (spliter && text.includes(spliter)) {
      message.success(`${t('复制')}${text.split('\n').length}${t('条数据到剪贴板')}`);
    } else {
      message.success(t('复制到剪贴板'));
    }
  } catch (err) {
    message.error(t('复制失败'));
    succeeded = false;
  }
  if (succeeded) {
    document.body.removeChild(fakeElem);
  }
  return succeeded;
};

export function formatTrim(s: string) {
  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (s[i]) {
      case '.':
        i0 = i1 = i;
        break;

      case '0':
        if (i0 === 0) i0 = i;
        i1 = i;
        break;

      default:
        if (i0 > 0) {
          if (!+s[i]) break out;
          i0 = 0;
        }
        break;
    }
  }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}
interface Route {
  path: string;
  component: JSX.Element | Component;
}
export interface Entry {
  menu?: {
    weight?: number;
    content: ReactNode;
  };
  routes: Route[];
  module?: IStore<any>;
}

export const dynamicPackages = (): Entry[] => {
  const Packages = import.meta.globEager('../Packages/*/entry.tsx');
  return Object.values(Packages).map((obj) => obj.default);
};

export const generateID = (): string => {
  return `_${Math.random().toString(36).substr(2, 9)}`;
};

// https://github.com/n9e/fe-v5/issues/72 修改 withByte 默认为 false
export const sizeFormatter = (
  val,
  fixedCount = 2,
  { withUnit = true, withByte = false, trimZero = false, convertNum = 1024 } = {
    withUnit: true,
    withByte: false,
    trimZero: false,
    convertNum: 1024 | 1000,
  },
) => {
  const size = val ? Number(val) : 0;
  let result;
  let unit = '';

  if (size < 0) {
    result = 0;
  } else if (size < convertNum) {
    result = size.toFixed(fixedCount);
  } else if (size < convertNum * convertNum) {
    result = (size / convertNum).toFixed(fixedCount);
    unit = 'K';
  } else if (size < convertNum * convertNum * convertNum) {
    result = (size / convertNum / convertNum).toFixed(fixedCount);
    unit = 'M';
  } else if (size < convertNum * convertNum * convertNum * convertNum) {
    result = (size / convertNum / convertNum / convertNum).toFixed(fixedCount);
    unit = 'G';
  } else if (size < convertNum * convertNum * convertNum * convertNum * convertNum) {
    result = (size / convertNum / convertNum / convertNum / convertNum).toFixed(fixedCount);
    unit = 'T';
  }

  trimZero && (result = parseFloat(result));
  withUnit && (result = `${result}${unit}`);
  withByte && (result = `${result}B`);
  return result;
};

export function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}
export const RSAEncrypt = (str: string): string => {
  if (!str) return '';
  var encrypt = new JSEncrypt();
  encrypt.setPublicKey(`-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoEyQB7GhjPdmHZ7gpvG7
  QMuI224WL3L+CGEtl6E0ypxp1czaLV2TN8POSmRZmjsmaHthkIHiZg2uRvijYX+F
  2a7XrRh3xZ+s51dtxrbhufYhMvYQFmXpAkYUjMrKn3hGzssONBoOxauJyec3bIFj
  lcz2nnTRT/xW+mqCoFPoAx2fwOhVurRQSvP2d4mBEDjmCt+frDTj1EW1HjA1QujX
  XX55KvL+VUmqjU8auj4Pm/4yn8tL8mkv2wCOrYOwylwEYNx1oc2Rczze4B6Rup6B
  wAQBLBZ/TQPFtUDBF/b3i+nWrR77onffeDplXrzXgfmOE5TclMFfhELBRCoiTvSY
  YQIDAQAB
  -----END PUBLIC KEY-----`);
  return encrypt.encrypt(str);
};

export function detectMob() {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4),
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor);
  return check;
}