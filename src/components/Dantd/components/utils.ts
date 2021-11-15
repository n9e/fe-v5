import locale from '@/components/Dantd/components/locale';

export const intlZhMap = (k: string) => {
  return locale['zh-CN'][k];
};

export const isClient = typeof window === 'object';
