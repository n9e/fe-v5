import _ from 'lodash';

export function isRegExpString(input: string) {
  const testRegExp = /^\/((?:\\\/|[^/])+)\/([migyu]{0,5})?$/;
  const parts = testRegExp.exec(input);
  if (parts) {
    try {
      const regex = new RegExp(parts[1], parts[2]);
      return regex instanceof RegExp;
    } catch (err) {
      console.error(`${input} => ${err.message}`);
    }
  }
  return false;
}

export function stringToRegExp(str: string): RegExp | false {
  const match = str.match(new RegExp('^/(.*?)/(g?i?m?y?)$'));
  if (match) {
    try {
      return new RegExp(match[1], match[2]);
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}

export function filterData<T>(data: T[], str: string): T[] {
  let matched: T[] = [];
  if (isRegExpString(str)) {
    const regExp = stringToRegExp(str);
    if (regExp) {
      matched = _.filter(data, (item) => {
        return regExp.test(item.name);
      });
    }
  } else {
    matched = _.filter(data, (item) => {
      return item.name === str;
    });
  }
  return matched;
}

export function extractText(str: string, pattern: string, useCaptureGroups: boolean) {
  if (isRegExpString(pattern)) {
    const extractPattern = stringToRegExp(pattern);
    if (extractPattern) {
      const extractedValue = extractPattern.exec(str);
      if (extractedValue) {
        if (useCaptureGroups) {
          return extractedValue[1];
        } else {
          return extractedValue[0];
        }
      }
      return '';
    }
    return '';
  }
  return '';
}
