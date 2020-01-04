interface Language<T> {
  key: string;
  values: T;
}

export interface UnListen {
  (): void;
}

export interface I18nConfig<T> {
  defaultLocale: Language<T>;
  loader?: (localName: string) => Promise<any>;
}

export class I18n<U extends object = object, T = object> {
  protected readonly defaultLocale: U;
  protected readonly loader: I18nConfig<U>['loader'];
  protected locales: Partial<Record<string, U>> = {};
  protected hashes: Partial<Record<string, string>> = {};
  // @ts-ignore
  protected current: U = {};
  protected currentName: string = '';
  protected listeners: ((localeName: string) => void)[] = [];
  protected caches: Partial<Record<string, any>> = {};

  private static CACHE_ROOT_KEY = '_._i18n_root_._';

  constructor(config: I18nConfig<U>) {
    this.defaultLocale = config.defaultLocale.values;
    this.loader = config.loader;

    this
      .define(config.defaultLocale.key, config.defaultLocale.values)
      .locale(config.defaultLocale.key);
  }

  public define(localeName: string, values: U): this {
    this.locales[localeName] = values;

    return this;
  }

  public async locale(name: string): Promise<this> {
    if (name === this.currentName) {
      return this;
    }

    const originalName = this.currentName;
    const language = this.locales[name];

    if (language) {
      this.currentName = name;
      this.publish(language);
    } else if (this.loader) {
      this.currentName = name;

      try {
        const response = await this.loader(name);
        let locale: U;

        if (response && response.__esModule) {
          locale = response.default;

          if (!this.isValidLocale(locale)) {
            throw new TypeError(`The locale named "${name}" has no default export`);
          }
        } else {
          locale = response;

          if (!this.isValidLocale(locale)) {
            throw new TypeError(`The locale data named "${name}" is invalid`);
          }
        }
        this.define(name, locale);

        if (this.currentName === name) {
          this.publish(locale);
        }
      } catch (error) {
        if (this.currentName === name) {
          this.currentName = originalName;
        }

        throw error;
      }
    } else {
      console.error(`I18n can't find locale "${name}"`);
    }

    return this;
  }

  public listen(fn: (localeName: string) => void): UnListen {
    this.listeners.push(fn);

    return () => {
      this.listeners = this.listeners.filter((item) => item !== fn);
    };
  }

  public t(key: string): any {
    if (this.caches[key]) {
      return this.caches[key];
    }

    const properties: string[] = key.split('.');
    const firstProperty = properties.shift()!;
    let result = this.chain()[firstProperty];

    if (properties.length) {
      let index = 0;

      for (; index < properties.length; ++index) {
        result = result[properties[index]];

        if (result === undefined) {
          break;
        }
      }

      if (result === undefined) {
        result = this.notFound(key);
      }
    }

    return result;
  }

  public chain(): T {
    const key = I18n.CACHE_ROOT_KEY;

    if (!this.caches[key]) {
      this.caches[key] = this.proxy(this.current, [], false);
    }

    return this.caches[key];
  }

  protected proxy(data: object, allProperties: string[], useDefaultLocal: boolean) {
    if (Array.isArray(data)) {
      return (params: object): string => {
        let message: string = data[0];
        const defaultParams: object = data[1];
        const newParams = Object.assign({}, defaultParams, params);

        for (const key of Object.keys(newParams)) {
          let replaceValue;

          if (typeof newParams[key] === 'function') {
            // Indeed, it's assigned from defaultParams.
            // It means that user doesn't input the value of this key, it only happens when Function has a default value.
            replaceValue = newParams[key]();
          } else if (typeof defaultParams[key] === 'function') {
            replaceValue = defaultParams[key](newParams[key]);
          } else {
            replaceValue = newParams[key];
          }

          message = message.replace(new RegExp(`\{\{${key}\}\}`, 'gm'), replaceValue);
        }

        return message;
      };
    }

    if (typeof data === 'object') {
      return this.createProxy(data, allProperties, useDefaultLocal);
    }

    return data;
  }

  protected createProxy(data: object, allProperties: string[], useDefaultLocal: boolean) {
    return new Proxy(data, {
      get: (target, property) => {
        if (!this.isValidProperty(property)) {
          return undefined;
        }

        return this.getProxyData(
          target, 
          allProperties,
          property, 
          useDefaultLocal,
        );
      },
    });
  }

  protected getProxyData(target: object, allProperties: string[], property: string, useDefaultLocal: boolean): any {
    const newAllProperties = allProperties.concat(property);
    const cacheKey = newAllProperties.join('.');
    let result: any;

    if (this.caches[cacheKey]) {
      return this.caches[cacheKey];
    }
    
    let proxyData = target[property];

    if (proxyData === undefined) {
      if (useDefaultLocal) {
        proxyData = this.notFound(newAllProperties);
      } else {
        // Fallback to default locale
        proxyData = this.recursiveDefaultData(newAllProperties);

        if (proxyData === undefined) {
          proxyData = this.notFound(newAllProperties);
        } else {
          // Found key in default locale
          useDefaultLocal = true;
        }
      }
    }
    
    result = this.proxy(proxyData, newAllProperties, useDefaultLocal);
    this.caches[cacheKey] = result;
    return result;
  }

  protected recursiveDefaultData(allProperties: string[]) {
    let proxyData = this.defaultLocale;
  
    for (const name of allProperties) {
      proxyData = proxyData[name];

      if (proxyData === undefined) {
        break;
      }
    }

    return proxyData;
  }

  protected notFound(properties: string | string[]): string {
    const data = typeof properties === 'string' ? properties : properties.join('.');

    console.error(`I18n can't find property "${data}"`);

    return data;
  }

  protected isValidProperty(property: string | number | symbol): property is string {
    return property !== '$$typeof' && typeof property === 'string';
  }

  protected isValidLocale(locale: U): boolean {
    return locale !== null && typeof locale === 'object';
  }

  protected publish(values: U): void {
    this.current = values;
    this.caches = {};
    this.listeners.forEach((listener) => listener(this.currentName));
  }
}
