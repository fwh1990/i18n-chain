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

export class I18n<U extends object, T = Locale<U>> {
  protected readonly defaultLocale: U;
  protected readonly loader: I18nConfig<T>['loader'];
  protected locales: Partial<Record<string, U>> = {};
  protected hashes: Partial<Record<string, string>> = {};
  // @ts-ignore
  protected current: U = {};
  protected currentName: string = '';
  protected listeners: ((localeName: string) => void)[] = [];

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

  public get chain(): T {
    // @ts-ignore
    return new Proxy(this, {
      get: (_, property) => {
        if (!this.isValidProperty(property)) {
          return undefined;
        }

        const properties: string[] = property.split('.');
        const firstProperty = properties.shift()!;
        let result: any;
        let hasData: boolean = false;

        if (this.current[firstProperty]) {
          hasData = true;
          result = this.proxy(this.current[firstProperty], [firstProperty], false);
        } else if (this.defaultLocale[firstProperty]) {
          hasData = true;
          result = this.proxy(this.defaultLocale[firstProperty], [firstProperty], true);
        }

        if (hasData) {
          if (properties.length) {
            for (const name of properties) {
              result = result[name];
            }
          }

          return result;
        }

        return this.notFound([property]);
      },
    });
  }

  protected proxy(data: any, allProperties: string[], useDefaultLocal: boolean) {
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
    } else if (typeof data === 'object') {
      return new Proxy(data, {
        get: (target, property) => {
          if (!this.isValidProperty(property)) {
            return undefined;
          }

          const properties: string[] = property.split('.');
          const firstProperty = properties.shift()!;
          const newAllProperties = allProperties.concat(firstProperty);
          let proxyData = target[firstProperty];

          if (proxyData === undefined) {
            if (useDefaultLocal) {
              return this.notFound(newAllProperties);
            }
      
            // Fallback to default locale
            proxyData = this.defaultLocale;
      
            for (const name of newAllProperties) {
              proxyData = proxyData[name];
      
              if (proxyData === undefined) {
                break;
              }
            }

            if (proxyData === undefined) {
              return this.notFound(newAllProperties);
            }

            // Found key in default locale
            useDefaultLocal = true;
          }
          
          let result = this.proxy(proxyData, newAllProperties, useDefaultLocal);

          if (properties.length) {
            for (const name of properties) {
              result = result[name];
            }
          }

          return result;
        },
      });
    }

    return data;
  }

  protected notFound(properties: string[]): string {
    const data = properties.join('.');

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
    this.listeners.forEach((listener) => listener(this.currentName));
  }
}
