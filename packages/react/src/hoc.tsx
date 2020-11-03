import React, { ComponentClass, FC } from 'react';
import hoist from 'hoist-non-react-statics';
import { I18n } from '@i18n-chain/core';
import { hook } from './hook';

export type InjectedI18nProps<T extends I18n<any, any>> = {
  chain: T extends I18n<any, infer T> ? T : never;
}

export const hoc = <U extends object, T = object>(i18n: I18n<U, T>) => {
  return function<P extends InjectedI18nProps<I18n<U, T>>>(WrappedComponent: ComponentClass<P>): FC<Omit<P, 'chain'>> {
    const I18nComponent: FC<P & InjectedI18nProps<I18n<U, T>>> = (props) => {
      return <WrappedComponent {...props} chain={hook(i18n)} />;
    };

    // @ts-ignore
    return hoist(I18nComponent, WrappedComponent);
  };
};
