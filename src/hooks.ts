import { I18n } from './I18n';
import { useState, useEffect } from 'react';

export function useI18n<G extends object, T extends object>(i18n: I18n<G, T>): T {
  const [data, setData] = useState(() => i18n.chain);

  useEffect(() => {
    // @ts-ignore
    const unListen = i18n.listen(() => {
      setData(i18n.chain);
    });

    return unListen;
  }, [i18n]);

  return data;
}