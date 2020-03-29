# Installation
```bash
yarn add @i18n-chain/taro

# OR

npm install @i18n-chain/taro
```

# Create i18n instance
Visit [Github Repo](https://github.com/fwh1990/i18n-chain) to get more information.

# Use with Hooks

```typescript jsx
// ./src/components/App.tsx

import Taro, { FC } from '@tarojs/taro';
import { useI18n } from '@i18n-chain/taro';
import i18n from '../i18n';

const App: FC = () => {
  // For re-render when i18n switch locale
  const hack = useI18n(i18n);

  return <button>{hack(i18n).button.submit}</button>;
};

export default App;
```

# Use with Component

```typescript jsx
// ./src/components/App.tsx

import Taro, { Component } from '@tarojs/taro';
import { I18nProvider, hack } from '@i18n-chain/taro';
import i18n from '../i18n';

// Must use decorator in taro
@I18nProvider(i18n)
class App extends Component {
  return <button>{hack(i18n).button.submit}</button>;
};

// For re-render when i18n switch locale
export default App;
```
