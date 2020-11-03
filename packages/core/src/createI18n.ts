import { I18nConfig, I18n } from './I18n';
import { I18nPolyfill } from './I18nPolyfill';

type HasDefault<T> = {
  [key in keyof T]: T[key] extends undefined
    ? never
    : T[key] extends (...args: infer P) => any
      ? undefined extends P[0]
        ? key
        : never
      : key
    }[keyof T];

type NoDefault<T> = {
  [key in keyof T]: T[key] extends undefined
    ? key
    : T[key] extends (...args: infer P) => any
      ? undefined extends P[0]
        ? never
        : key
      : never
}[keyof T];

type ParameterType<T> = T extends undefined
  ? string | number
  : T extends (...args: infer P) => any
    ? P[0]
    : T;

export type Locale<U extends object> = {
  [key in keyof U]: U[key] extends Array<any>
    ? Extract<U[key][number], object> extends infer R
      ? NoDefault<R> extends never
        ? HasDefault<R> extends never
          ? () => string
          : (params?: { [p in HasDefault<R>]?: ParameterType<R[p]> }) => string
        : HasDefault<R> extends never
          ? (params: { [p in NoDefault<R>]: ParameterType<R[p]> }) => string
          : (params: { [p in NoDefault<R>]: ParameterType<R[p]> } & { [p in HasDefault<R>]?: ParameterType<R[p]> }) => string
      : never
    : U[key] extends object
      ? Locale<U[key]>
      : U[key]
};

export function createI18n<U extends object, T = Locale<U>>(config: I18nConfig<U>): I18n<U, T> {
  if (typeof Proxy === 'function') {
    return new I18n<U, T>(config);
  } else {
    return createLegacyI18n<U, T>(config);
  }
}

export function createLegacyI18n<U extends object, T = Locale<U>>(config: I18nConfig<U>): I18n<U, T> {
  return new I18nPolyfill<U, T>(config);
}
