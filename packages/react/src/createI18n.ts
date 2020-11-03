import { createI18n as original, I18n, I18nConfig, Locale } from '@i18n-chain/core';
import { hoc } from './hoc';
import { hook } from './hook';

type I18nInstance<U extends object, T = object> = I18n<U, T> & {
  use: ReturnType<typeof hook>;
  hoc: ReturnType<typeof hoc>;
}

export function createI18n<U extends object, T = Locale<U>>(config: I18nConfig<U>): I18nInstance<U, T> {
  const i18n = original(config);
  // @ts-expect-error
  const enhanced: I18nInstance<U, T> = i18n;
  enhanced.use = () => hook(i18n);
  enhanced.hoc = hoc(i18n);

  return enhanced;
};