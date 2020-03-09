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

type Locale<U extends object> = {
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

export type I18nInstance<U extends object = object, T = object> = T & {
  _: Omit<I18n<U, T>, 'chain'>;
};

export function createPolyfillI18n<U extends object, K extends object, T = Locale<U>>(config: I18nConfig<U>, data?: K): I18nInstance<U, T> {
  const instance = new I18nPolyfill<U, T>(config);
  const dataa = data || {};

  Object.defineProperty(data, '_', {
    value: instance,
  });
  
  Object.keys(config.defaultLocale.values).forEach((property) => {
    Object.defineProperty(data, property, {
      get: () => {
        return instance.chain()[property];
      },
    });
  });

  // @ts-ignore
  return dataa;
}

export function createI18n<U extends object, K extends object, T = Locale<U>>(config: I18nConfig<U>, data?: K): I18nInstance<U, T> {
  if (typeof Proxy === 'function') {
    const instance = new I18n<U, T>(config);

    // @ts-ignore
    return new Proxy(data || {}, {
      get: (_, property) => {
        if (property === '_') {
          return instance;
        }

        return instance.chain()[property];
      },
    });
  }

  return createPolyfillI18n(config);
}
