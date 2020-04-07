**English** | [中文](https://github.com/fwh1990/i18n-chain/blob/master/README-CN.md)

Are you always copy and paste duplicate i18n code like `t('home:submit')` `t('common:something:success')`. It take working slowly, and you are very easy to make typo if you don't recheck words carefully.

I don't like that way, I prefer to write code as a chain like `i18n.common.something.success` with `typescript` checking. So, why not try this package?

# Compatibility
| IE | Edge | Chrome | Firefox | Safari | Node |
| -- | -- | -- | -- | -- | -- |
| 9+ | 12+ | 5+ | 4+ | 5+ | * |

# Define locales
```typescript
// ./src/i18n/locales/en.ts

const en = {
  button: {
    submit: 'Submit',
    cancel: 'Go back',
  },
  user: {
    profile: 'Tom',
  },
};

export default en;
export type Locale = typeof en;
```

```typescript
// ./src/i18n/locales/zh.ts

import { Locale } from './en';

const zh: Locale = {
  button: {
    submit: '提交',
    cancel: '返回',
  },
  user: {
    profile: '原罪',
  },
};

export default zh;
```

# Create i18n instance
```typescript
// ./src/i18n/index.ts

import { createI18n } from '@i18n-chain/*';
import en from './locales/en';

const i18n = createI18n({
  defaultLocale: {
    key: 'en',
    values: en,
  },
});

export default i18n;
```

# Import locales
First way, **define** immediately.
```typescript
import { createI18n } from '@i18n-chain/*';
import zh from './locales/zh';

const i18n = createI18n({
  defaultLocale: { ... },
});

i18n._.define('zh', zh);

export default i18n;
```

Second way, **async import**. loader will be invoked when locales doesn't defined.
```typescript
const i18n = createI18n({
  defaultLanguage: { ... },
  loader: (name) => import('./locales/' + name),
});

export default i18n;
```

# Switch locale
```typescript
i18n._.locale('zh');
```

# String literal
Feel free to try `i18n._.t('button.submit')` and `i18n.button.submit`, they have the same effect. Unfortunately, you can't enjoy type checking by using `chain._.t('xx.yy.zz')`.

# Template with parameters
You are required to use array to define template when parameters exist.
```javascript
const en = {
  property: ['{{property1}}template{{property2}}', { property1: value2, property2: value2 }],
};
```

The second element in array is an object that is default value of template.

```typescript
const en = {
  user: {
    profile: [
      'My name is {{name}}, I born in {{country}}, I am {{age}} old now, my birthday is {{birthday}}',
      {
        country: undefined,
        name: 'Tom',
        age: (value: number = 20) => {
          if (value <= 1) {
            return `${value} year`;
          } else {
            return `${value} years`;
          }
        },
        birthday: (value: Date) => {
          return value.toString();
        },
      },
    ],
  },
};

////////////////////////////////////
// The above code equivalent to definition below: (automatically)
interface User {
  Profile {
    country: string | number;
    name?: string;
    age?: number;
    birthday: Date;
  }
}
/////////////////////////////////////

// Minium configuration
i18n.user.profile({
  country: 'Earth',
  birthday: new Date(),
});

// Append optional property `name` and `age`
i18n.user.profile({
  country: 'Earth',
  name: 'Lucy',
  age: 30,
  birthday: new Date(),
});
```

The primary difference between method `age` and `birthday` is: `age` has default parameter `(value: number = 20) => {...}` but `birthday` doesn't have. It's optional to input value to property who has default parameter value on function.

------------

Set `undefined` to property if you want to force input value when invoking method.

```typescript
const en = {
  template: ['Hello, {{world}}', { world: undefined }]
};
```


# Detail Usage
| Platform | Package |
| -- | -- |
| React & React-Native | [@i18n-chain/react](./packages/react) |
| Taro | [@i18n-chain/taro](./packages/taro) |
| NodeJs & Vanilla-Js | [@i18n-chain/core](./packages/core) |


# Demos
[React I18n](https://github.com/easy-demo/react-i18n-demo)
