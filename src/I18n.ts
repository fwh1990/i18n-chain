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

export class I18n<T extends object> {
  protected readonly defaultLanguage: Language<T>;
  protected readonly loader: I18nConfig<T>['loader'];
  protected languages: Partial<Record<string, Language<T>['values']>> = {};
  protected hashes: Partial<Record<string, string>> = {};
  protected currentLanguageName: string = '';
  // @ts-ignore
  protected currentLanguage: T = {};

  protected listeners: Function[] = [];

  protected caches: Record<string, ProxyConstructor> = {};

  constructor(config: I18nConfig<T>) {
    this.defaultLanguage = config.defaultLanguage;
    this.loader = config.loader;

    this
      .define(config.defaultLanguage.key, config.defaultLanguage.values)
      .use(config.defaultLanguage.key);
  }

  public define(key: string, values: T): this {
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

  public get data(): T {
    // TODO: Cache proxy

    // @ts-ignore
    return new Proxy(this, {
      get: (target, property: string | number) => {
        if (target.currentLanguage[property]) {
          return this.proxy(target.currentLanguage, property, [], false);
        }

        if (target.defaultLanguage[property]) {
          return this.proxy(target.defaultLanguage, property, [], true);
        }

        console.error(`I18n can not find property "${property}"`);
        // Or throw error
        return property;
      },
    });
  }

  protected proxy(parent: any, child: string | number, properties: Array<string | number>, useDefault: boolean) {
    const data = parent[child];
    const newProperties = properties.concat(child);

    if (data === undefined) {
      if (useDefault) {
        return newProperties.join('.');
      }

      // Fallback to default language
      let newData = this.defaultLanguage;

      for (const property of properties) {
        newData = newData[property];

        if (newData === undefined) {
          return newProperties.join('.');
        }
      }
    } else if (typeof data === 'object') {
      return new Proxy(data, {
        get: (target, property: string | number) => {
          return this.proxy(target, property, newProperties, useDefault);
        },
      });
    }

    return data;
  }

  protected listen(fn: Function): UnListen {
    this.listeners.push(fn);

    return () => {
      this.listeners = this.listeners.filter((item) => item !== fn);
    };
  }

  protected publish(values: T): void {
    this.currentLanguage = values;
    this.listeners.forEach((listener) => listener());
  }
}
