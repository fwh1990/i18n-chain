说到国际化，你是否也常年奔波于复制粘贴的重复劳动里？像 `t('home:submit')` `t('common:something:success')` 这些没有任何提示，需要脑子去记，不仅开发效率低，而且键盘敲快一点就容易打错字母，重点是你基本发现不了这种错误。

我更喜欢有提示的代码，利用`typescript`，我发明了一种使用链式操作的i18n组件，并拥有所有提示，就类似 `i18n.common.something.success` 这种，代码可以自动补全，保证不会写错。

# 兼容性
| IE | Edge | Chrome | Firefox | Safari | Node |
| -- | -- | -- | -- | -- | -- |
| 9+ | 12+ | 5+ | 4+ | 5+ | * |

# 安装
### React | RN | Taro@3
```bash
yarn add @i18n-chain/react
```

### NodeJS
```bash
yarn add @i18n-chain/node
```

# 使用

### 定义本地化文件
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

### 创建i18n实例
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

### 导入语言
第一种, **直接定义**：
```typescript
import { createI18n } from '@i18n-chain/*';
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

### 切换语言
```typescript
i18n._.locale('zh');
```

### 字符串模板
有时候您需要在组件外预定义一系列内容，此时不得不使用字符串模板（`'button.submit'`）来代表，并在组件渲染时翻译成相应的文字。很显然，这串字符串没有任何提示，即使写错了也没人知道。

别担心，框架提供了生成字符串模板的功能，现在一起试试
```typescript
const key = i18n.toLiteral.button.submit;
key === 'button.submit' // true

const value = i18n.translate(str);
value === 'Submit' // true
```
酷，带有提示的字符串模板也重新拥有了灵魂，不必再担心会写错了，让IDE和TS去处理吧。

### 带参数的模板
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
    age?: number;
    birthday: Date;
  }
}
/////////////////////////////////////

// 最小化调用
i18n.chain.user.profile({
  country: 'Earth',
  birthday: new Date(),
});

// 增加可选的属性：`name` 和 `age`
i18n.chain.user.profile({
  country: 'Earth',
  name: 'Lucy',
  age: 30,
  birthday: new Date(),
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

### 在Hooks中使用

```typescript jsx
import React, { FC } from 'react';
import i18n from '../i18n';

const App: FC = () => {
  // 使用use使得切换语言时可以重渲染
  const chain = i18n.use();

  return <button>{chain.button.submit}</button>;
};

export default App;
```

### 在Class组件中使用

```typescript jsx
import React, { PureComponent } from 'react';
import i18n from '../i18n';

class App extends PureComponent {
  render() {
    const { chain } = this.props;

    return <button>{chain.button.submit}</button>;
  }
};

// 使用高阶组件使得切换语言时可以重渲染
export default i18n.hoc(App);
```

# 案例
[React I18n](https://github.com/easy-demo/react-i18n-demo)
