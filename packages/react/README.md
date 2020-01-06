# Installation
```bash
yarn add @i18n-chain/react

# OR

npm install @i18n-chain/react
```

# Create i18n instance
Visit [Github Repo](https://github.com/fwh1990/i18n-chain) to get more information.

# Use with React-Hooks

```typescript jsx
// ./src/components/App.tsx

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
// ./src/components/App.tsx

import React, { FC } from 'react';
import { I18nProvider } from '@i18n-chain/react';
import i18n from '../i18n';

const App: FC = () => {
  return <button>{i18n.button.submit}</button>;
};

// For re-render when i18n switch locale
export default I18nProvider(i18n)(App);
```
