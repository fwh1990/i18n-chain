import { I18n } from '@i18n-chain/core';
import { useState, useEffect } from 'react';

export function hook<U extends object, T>(i18n: I18n<U, T>): I18n<U, T>['chain'] {
  const [, setSign] = useState(() => i18n.getLocaleName());

  useEffect(() => {
    return i18n.listen(() => {
      setSign(i18n.getLocaleName());
    });
  }, []);

  return i18n.chain;
}
