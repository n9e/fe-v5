/*
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
import { useState, useEffect } from 'react';
import useMediaQuery from './use-media';

export const MediaQueryEnum = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px) and (max-width: 767px)',
  md: '(min-width: 768px) and (max-width: 991px)',
  lg: '(min-width: 992px) and (max-width: 1199px)',
  xl: '(min-width: 1200px) and (max-width: 1599px)',
  xxl: '(min-width: 1600px)',
};

export type MediaQueryKey = keyof typeof MediaQueryEnum;

/**
 * loop query screen className
 * Array.find will throw a error
 * `Rendered more hooks than during the previous render.`
 * So should use Array.forEach
 */
export const getScreenClassName = () => {
  let className: MediaQueryKey = 'md';
  // support ssr
  if (typeof window === 'undefined') {
    return className;
  }
  const mediaQueryKey = (Object.keys(MediaQueryEnum) as MediaQueryKey[]).find(
    (key) => {
      const matchMedia = MediaQueryEnum[key];
      if (window.matchMedia(matchMedia).matches) {
        return true;
      }
      return false;
    },
  );
  className = mediaQueryKey as unknown as MediaQueryKey;
  return className;
};

const useMedia = () => {
  const isMd = useMediaQuery(MediaQueryEnum.md);
  const isLg = useMediaQuery(MediaQueryEnum.lg);
  const isXxl = useMediaQuery(MediaQueryEnum.xxl);
  const isXl = useMediaQuery(MediaQueryEnum.xl);
  const isSm = useMediaQuery(MediaQueryEnum.sm);
  const isXs = useMediaQuery(MediaQueryEnum.xs);
  const [colSpan, setColSpan] = useState<keyof typeof MediaQueryEnum>(
    getScreenClassName(),
  );

  useEffect(() => {
    if (isXxl) {
      setColSpan('xxl');
      return;
    }
    if (isXl) {
      setColSpan('xl');
      return;
    }
    if (isLg) {
      setColSpan('lg');
      return;
    }
    if (isMd) {
      setColSpan('md');
      return;
    }
    if (isSm) {
      setColSpan('sm');
      return;
    }
    if (isXs) {
      setColSpan('xs');
      return;
    }
    setColSpan('md');
  }, [isMd, isLg, isXxl, isXl, isSm, isXs]);

  return colSpan;
};

export default useMedia;
