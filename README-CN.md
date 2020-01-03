说到国际化，你是否也常年奔波于复制粘贴的重复劳动里？像 `t('home:submit')` `t('common:something:success')` 这些没有任何提示，需要脑子去记，不仅开发效率低，而且键盘敲快一点就容易打错字母，重点是你基本发现不了这种错误。

我更喜欢有提示的代码，利用`typescript`，我发明了一种使用链式操作的i18n组件，并拥有所有提示，就类似 `i18n.common.something.success` 这种，代码可以自动补全，保证不会写错。

# 安装
```bash
# Npm
npm install react-i18n-chain

#Yarn
yarn add react-i18n-chain
```

# 案例
[点击这里](https://github.com/easy-demo/react-i18n-demo)

# 定义本地化文件
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

# 创建i18n实例
```typescript
// ./src/i18n/index.ts

import { createI18n } from 'react-i18n-chain';
import en from './locales/en';

const i18n = createI18n({
  defaultLocale: {
    key: 'en',
    values: en,
  },
});

export default i18n;
```

# 在React-Hooks中使用i18n

```typescript jsx
// ./src/components/App.ts

import React, { FC } from 'react';
import { useI18n } from 'react-i18n-chain';
import i18n from '../i18n';

const App: FC = () => {
  // 切换语言时可以触发重渲染
  useI18n(i18n);

  return <button>{i18n.button.submit}</button>;
};

export default App;
```

# 在React-Component中使用i18n

```typescript jsx
// ./src/components/App.ts

import React, { FC } from 'react';
import { I18nProvider } from 'react-i18n-chain';
import i18n from '../i18n';

const App: FC = () => {
  return <button>{i18n.button.submit}</button>;
};

// 切换语言时可以触发重渲染
export default I18nProvider(i18n)(App);
```

# 导入语言
第一种, **直接定义**：
```typescript
import { createI18n } from 'react-i18n-chain';
import zh from './locales/zh';

const i18n = createI18n({
  defaultLocale: { ... },
});

i18n._.define('zh', zh);

export default i18n;
```

第二种, **异步导入**。当组件检测到语言未定义时，会自动触发`loader`函数
```typescript
const i18n = createI18n({
  defaultLanguage: { ... },
  loader: (name) => import('./locales/' + name),
});

export default i18n;
```

# 切换语言
```typescript
i18n._.locale('zh');
```

# 调用字符串
你可以随意地切换 `i18n['button.submit']` 和 `i18n.button.submit`，他们是等价的。唯一的区别就是前者无法享受到typescript的类型提示。

# 带参数的模板
当你想用参数的时候，你需要把模板写成数组的形式
```javascript
const en = {
  property: ['{{property1}}template{{property2}}', { property1: value2, property2: value2 }],
};
```
数组第二个元素就是参数列表以及，你可以设置参数的默认值。

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
// 上面的代码可以自动推导出和下面一致的类型：
interface User {
  Profile {
    country: string | number;
    name?: string;
    birthday: Date;
    age?: number;
  }
}
/////////////////////////////////////

// 最小化调用
i18n.user.profile({
  age: 20,
  country: 'China',
});

// 增加可选的属性：`name`
i18n.user.profile({
  age: 30,
  country: 'Usa',
  name: 'Lucy',
});
```

方法参数 `age` 和 `birthday` 的区别是，`age`的形参中含有默认值`(value: number = 20) => {...}`，而后者没有。有默认值意味着调用的时候可以不传参数。

------------

普通参数如果没有默认值，需要设置成`undefined`，这样typescript才能正确识别，并强制要求调用者输入对应的参数值。

```typescript
const en = {
  template: ['Hello, {{world}}', { world: undefined }]
};
```
