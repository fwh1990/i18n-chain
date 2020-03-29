import { I18nInstance, hack } from '@i18n-chain/core';
import { useState, useEffect } from '@tarojs/taro';
import { getSignature, SPLIT_STR, getSignatures } from './util';

export function useI18n(...i18nList: I18nInstance[]): typeof hack {
  const [, setSign] = useState(() => getSignatures(i18nList));

  useEffect(() => {
    const listeners = i18nList.map((item, index) => {
      return item._.listen(() => {
        setSign((value) => {
          const data = value.split(SPLIT_STR);
          data[index] = getSignature(item);
          return data.join(SPLIT_STR);
        });
      });
    });

    return () => {
      listeners.forEach((unListen) => unListen());
    };
  }, []);

  return hack;
}
