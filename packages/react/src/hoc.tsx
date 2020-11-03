import React, { ComponentClass, FC } from 'react';
import hoist from 'hoist-non-react-statics';
import { I18n } from '@i18n-chain/core';
import { hook } from './hook';

export interface InjectedI18nProps {
  i18n: I18n;
}

export const hoc = (i18n: I18n) => {
  return function<T extends InjectedI18nProps>(WrappedComponent: ComponentClass<T>): FC<T & InjectedI18nProps> {
    const I18nComponent: FC<T & InjectedI18nProps> = (props) => {
      return <WrappedComponent {...props} i18n={hook(i18n)} />;
    };
  
    return hoist(I18nComponent, WrappedComponent);
  };
};
