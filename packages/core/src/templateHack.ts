import { I18nInstance } from './createI18n';

export const templateHack = <T extends I18nInstance>(instance: T): Omit<T, '_'> => {
  return instance;
};