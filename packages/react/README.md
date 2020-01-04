**English** | [中文](https://github.com/fwh1990/i18n-chain/blob/master/README-CN.md)

Are you always copy and paste duplicate i18n code like `t('home:submit')` `t('common:something:success')`. It take working slowly, and you are very easy to make typo if you don't recheck words carefully.

I don't like that way, I prefer to write code as a chain like `i18n.common.something.success` with `typescript` checking. So, why not try this package?

# Installation
```bash
yarn add @i18n-chain/react

// OR

npm install @i18n-chain/react
```

# Demos
[React I18n](https://github.com/easy-demo/react-i18n-demo)

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

import { createI18n } from '@i18n-chain/react';
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
import { createI18n } from '@i18n-chain/react';
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
    birthday: Date;
    age?: number;
  }
}
/////////////////////////////////////

// Minium configuration
i18n.user.profile({
  age: 20,
  country: 'China',
});

// Append optional property `name`
i18n.user.profile({
  age: 30,
  country: 'Usa',
  name: 'Lucy',
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


# Use with React-Hooks

```typescript jsx
// ./src/components/App.ts

import React, { FC } from 'react';
import { useI18n } from '@i18n-chain/react';
import i18n from '../i18n';

const App: FC = () => {
  // For re-render when i18n switch locale
  useI18n(i18n);

  return <button>{i18n.button.submit}</button>;
};

export default App;
```

# Use with React-Component

```typescript jsx
// ./src/components/App.ts

import React, { FC } from 'react';
import { I18nProvider } from '@i18n-chain/react';
import i18n from '../i18n';

const App: FC = () => {
  return <button>{i18n.button.submit}</button>;
};

// For re-render when i18n switch locale
export default I18nProvider(i18n)(App);
```
