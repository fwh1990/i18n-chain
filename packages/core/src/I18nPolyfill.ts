import { I18n } from './I18n';

export class I18nPolyfill<U extends object = object, T = object> extends I18n<U, T> {
  protected createProxy(data: object, allProperties: string[], useDefaultLocal: boolean, literal: boolean) {
    const proxyData = {};
    let toDefineProperty = { ...data };

    if (!useDefaultLocal) {
      toDefineProperty = {
        ...toDefineProperty,
        ...this.recursiveDefaultData(allProperties),
      }
    }

    Object.keys(toDefineProperty).forEach((property) => {
      Object.defineProperty(proxyData, property, {
        get: () => {
          return this.getProxyData(
            data,
            allProperties,
            property,
            useDefaultLocal,
            literal,
          );
        },
      });
    });

    return proxyData;
  }
}
