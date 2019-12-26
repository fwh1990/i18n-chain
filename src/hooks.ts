import { I18n } from './I18n';
import { useState, useEffect } from 'react';

export function useI18n<T extends object>(i18n: I18n<T>): T {
  const [, setCount] = useState(0);

  useEffect(() => {
     // @ts-ignore
    const unListen = i18n.listen(() => {
      setCount((prev) => prev + 1);
    });

    return unListen;
  }, []);

  return i18n.data;
}