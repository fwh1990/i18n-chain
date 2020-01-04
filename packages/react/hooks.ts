import { I18nInstance } from '@i18n-chain/core';
import { useState, useEffect } from 'react';

export function useI18n(i18n: I18nInstance): void {
  const [, setData] = useState('');

  useEffect(() => {
    return i18n._.listen(setData);
  }, [i18n]);

  return;
}
