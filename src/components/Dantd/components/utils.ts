import locale from '@/components/dantd/components/locale';

export const intlZhMap = (k: string) => {
  return locale['zh-CN'][k];
};

export const isClient = typeof window === 'object';
