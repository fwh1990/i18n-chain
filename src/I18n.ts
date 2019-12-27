interface Language<T> {
  key: string;
  values: T;
}

export interface UnListen {
  (): void;
}

interface I18nConfig<T> {
  defaultLanguage: Language<T>;
  loader?: (key: string) => Promise<any>;
}

type HasDefault<T> = {[key in keyof T]: T[key] extends undefined ? never : key}[keyof T];

type NoDefault<T> = {[key in keyof T]: T[key] extends undefined ? key : never}[keyof T];

type Locale<U extends object> = {
  [key in keyof U]: U[key] extends Array<any>
    ? Extract<U[key][number], object> extends infer R
      ? (
        params: NoDefault<R> extends never
          ? HasDefault<R> extends never
            ? never
            : { [p in HasDefault<R>]?: string | number }
          : HasDefault<R> extends never
            ? { [p in NoDefault<R>]: string | number }
            : { [p in NoDefault<R>]: string | number } & { [p in HasDefault<R>]?: string | number }
        ) => Exclude<U[key][0], object>
      : never
    : U[key] extends object
      ? Locale<U[key]>
      : U[key]
};

export class I18n<U extends object, T = Locale<U>> {
  protected readonly defaultLanguage: Language<U>;
  protected readonly loader: I18nConfig<T>['loader'];
  protected languages: Partial<Record<string, Language<U>['values']>> = {};
  protected hashes: Partial<Record<string, string>> = {};
  protected currentLanguageName: string = '';
  // @ts-ignore
  protected currentLanguage: U = {};

  protected listeners: ((locale: string) => void)[] = [];

  protected caches: Record<string, ProxyConstructor> = {};

  constructor(config: I18nConfig<U>) {
    this.defaultLanguage = config.defaultLanguage;
    this.loader = config.loader;

    this
      .define(config.defaultLanguage.key, config.defaultLanguage.values)
      .use(config.defaultLanguage.key);
  }

  public define(key: string, values: U): this {
    this.languages[key] = values;

    return this;
  }

  public use(key: string): this {
    if (key === this.currentLanguageName) {
      return this;
    }

    const originalName = this.currentLanguageName;
    const language = this.languages[key];

    if (language) {
      this.currentLanguageName = key;
      this.publish(language);
    } else if (this.loader) {
      this.currentLanguageName = key;

      this.loader(key).then((response) => {
        const locale = response && response.__esModule ? response.default : response;

        this.define(key, locale);
        if (this.currentLanguageName === key) {
          this.publish(locale);
        }
      }).catch((error) => {
        console.error(error.message);
        if (this.currentLanguageName === key) {
          this.currentLanguageName = originalName;
        }
      });
    } else {
      console.error(`I18n can not find language "${key}"`);
    }

    return this;
  }

  public get chain(): T {
    // @ts-ignore
    return new Proxy(this, {
      get: (target, property) => {
        if (!this.isValidProperty(property)) {
          return undefined;
        }

        const properties: string[] = property.split('.');
        const first = properties.shift()!;
        let result: any;
        let hasData: boolean = false;

        if (target.currentLanguage[first]) {
          hasData = true;
          result = this.proxy(target.currentLanguage[first], [first], false);
        } else if (target.defaultLanguage[first]) {
          result = this.proxy(target.defaultLanguage[first], [first], true);
          hasData = true;
        }

        if (hasData) {
          for (const name of properties) {
            result = result[name];
          }

          return result;
        }

        console.error(`I18n can not find property "${property}"`);
        // Or throw error
        return property;
      },
    });
  }

  protected proxy(data: any, allProperties: string[], useDefault: boolean) {
    if (Array.isArray(data)) {
      return (params: object): string => {
        let message: string = data[0];
        const defaultParams: object = data[1]; 
        const newParams = Object.assign({}, defaultParams, params);

        for (const key of Object.keys(newParams)) {
          if (typeof newParams[key] === 'string' || typeof newParams[key] === 'number') {
            message = message.replace(new RegExp(`\{\{${key}\}\}`, 'gm'), newParams[key]);
          }
        }

        return message;
      };
    } else if (typeof data === 'object') {
      return new Proxy(data, {
        get: (target, property) => {
          if (!this.isValidProperty(property)) {
            return undefined;
          }

          const properties: string[] = property.split('.');
          const first = properties.shift()!;
          const newAllProperties = allProperties.concat(first);
          let proxyData = target[first];

          if (proxyData === undefined) {
            if (useDefault) {
              // TODO: May be throw Error
              return newAllProperties.join('.');
            }
      
            // Fallback to default language
            proxyData = this.defaultLanguage;
      
            for (const name of allProperties) {
              proxyData = proxyData[name];
      
              if (proxyData === undefined) {
                // TODO: May be throw Error
                return newAllProperties.join('.');
              }
            }

            // Found key in default language
            useDefault = true;
          }
          
          let result = this.proxy(proxyData, newAllProperties, useDefault);

          for (const name of properties) {
            result = result[name];
          }

          return result;
        },
      });
    }

    return data;
  }

  protected isValidProperty(property: string | number | symbol): property is string {
    return property !== '$$typeof' && typeof property === 'string';
  }

  protected listen(fn: (locale: string) => void): UnListen {
    this.listeners.push(fn);

    return () => {
      this.listeners = this.listeners.filter((item) => item !== fn);
    };
  }

  protected publish(values: U): void {
    this.currentLanguage = values;
    this.listeners.forEach((listener) => listener(this.currentLanguageName));
  }
}
