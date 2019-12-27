# Installation
```bash
# Npm
npm install react-i18n-chain

#Yarn
yarn add react-i18n-chain
```

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
```

```typescript
// ./src/i18n/locales/zh.ts
import en from './en';

const zh: typeof en = {
  button: {
    submit: '提交',
    cancel: '返回',
  },
  user: {
    profile: '原罪',
  },
};
```

# Create i18n instance
```typescript
// ./src/i18n/index.ts

import { I18n } from 'react-i18n-chain';
import en from './locales/en';

const i18n = new I18n({
  defaultLanguage: {
    key: 'en',
    values: en,
  },
});

export default i18n;
```

# Use i18n with React-Hooks

```typescript jsx
// ./src/components/App.ts

import React, { FC } from 'react';
import { useI18n } from 'react-i18n-chain';
import i18n from '../i18n';

const App: FC = () => {
  // For re-render when i18n switch locale
  useI18n(i18n);

  return <button>{i18n.chain.button.submit}</button>;
};

export default App;
```

# Use i18n with React-Component

```typescript jsx
// ./src/components/App.ts

import React, { FC } from 'react';
import { I18nProvider } from 'react-i18n-chain';
import i18n from '../i18n';

const App: FC = () => {
  return <button>{i18n.chain.button.submit}</button>;
};

// For re-render when i18n switch locale
export default I18nProvider(i18n)(App);
```

# Switch locale
Here is two way to switch your locale language:

First, **define** immediately.
```typescript
import zh from './locales/zh';

const i18n = new I18n({
  defaultLanguage: { ... },
});

i18n.define('zh', zh);

export default i18n;
```

Second, **async import**. loader will be invoked when locales doesn't defined.
```typescript
const i18n = new I18n({
  defaultLanguage: { ... },
  loader: (name) => import('./locales/' + name),
});

export default i18n;
```

-------------

Now, we can switch locale by method:
```typescript
i18n.use('zh');
```

# Template with parameters
You are required to use array to define template when parameters exist.
```javascript
const en = {
  property: ['{{key1}}template{{key2}}', { key1: value2, key2: value2 }],
};
```

The second element in array is an object that is default value of template. Set `undefined` to key if you have no default value, it means that this key will be considered as required.

```typescript
const en = {
  user: {
    profile: ['My name is {{name}}, I am {{age}} years old now', { age: undefined, name: 'Tom' }],
  },
};

// The same as this definition:
//
// interface Profile {
//   age: string | number;
//   name?: string | number;
// }

i18n.chain.user.profile({
  age: 20, // Required
});
```