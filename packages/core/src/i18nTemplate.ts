import { I18nInstance } from './createI18n';

export const i18nTemplate = <T extends I18nInstance>(instance: T): Omit<T, '_'> => {
  return instance;
};