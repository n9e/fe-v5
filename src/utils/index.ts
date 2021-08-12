import { message } from 'antd';

export const isPromise = (obj) => {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
};

export const download = function (
  stringList: Array<string> | string,
  name: string = 'download.txt',
) {
  const element = document.createElement('a');
  const file = new Blob(
    [Array.isArray(stringList) ? stringList.join('\r\n') : stringList],
    { type: 'text/plain' },
  );
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
export const copyToClipBoard = (text: string): boolean => {
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
    if (text.includes('\n')) {
      message.success(`复制${text.split('\n').length}条数据到剪贴板`);
    } else {
      message.success('复制到剪贴板');
    }
  } catch (err) {
    message.error('复制失败');
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
