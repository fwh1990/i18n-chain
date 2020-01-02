interface Language<T> {
  key: string;
  values: T;
}

export interface UnListen {
  (): void;
}

interface I18nConfig<T> {
  defaultLocale: Language<T>;
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
  protected readonly defaultLocale: Language<U>;
  protected readonly loader: I18nConfig<T>['loader'];
  protected locales: Partial<Record<string, Language<U>['values']>> = {};
  protected hashes: Partial<Record<string, string>> = {};
  // @ts-ignore
  protected current: U = {};
  protected currentName: string = '';
  protected listeners: ((localeName: string) => void)[] = [];

  constructor(config: I18nConfig<U>) {
    this.defaultLocale = config.defaultLocale;
    this.loader = config.loader;

    this
      .define(config.defaultLocale.key, config.defaultLocale.values)
      .locale(config.defaultLocale.key);
  }

  public define(localeName: string, values: U): this {
    this.locales[localeName] = values;

    return this;
  }

  public locale(name: string): this {
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

      this.loader(name).then((response) => {
        const locale = response && response.__esModule ? response.default : response;

        this.define(name, locale);
        if (this.currentName === name) {
          this.publish(locale);
        }
      }).catch((error) => {
        console.error(error.message);
        if (this.currentName === name) {
          this.currentName = originalName;
        }
      });
    } else {
      console.error(`I18n can not find locale "${name}"`);
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

        if (target.current[first]) {
          hasData = true;
          result = this.proxy(target.current[first], [first], false);
        } else if (target.defaultLocale[first]) {
          result = this.proxy(target.defaultLocale[first], [first], true);
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
            proxyData = this.defaultLocale;
      
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

  protected listen(fn: (localeName: string) => void): UnListen {
    this.listeners.push(fn);

    return () => {
      this.listeners = this.listeners.filter((item) => item !== fn);
    };
  }

  protected publish(values: U): void {
    this.current = values;
    this.listeners.forEach((listener) => listener(this.currentName));
  }
}
