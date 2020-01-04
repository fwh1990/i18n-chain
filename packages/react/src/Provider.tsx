import React, { ComponentType, PureComponent } from 'react';
import hoist from 'hoist-non-react-statics';
import { I18nInstance, UnListen } from '@i18n-chain/core';
import { getSignature, SPLIT_STR, getSignatures } from './util';

type State = Readonly<{
  sign: string;
}>;

export const I18nProvider = (...i18nList: I18nInstance[]) => {
  return function<T>(WrappedComponent: ComponentType<T>): ComponentType<T> {
    class I18nComponent extends PureComponent<T, State> {
      static displayName = `I18n(${WrappedComponent.displayName || WrappedComponent.name})`;

      readonly state: State = {
        sign: getSignatures(i18nList),
      };

      protected listeners: UnListen[] = [];

      componentDidMount() {
        this.listeners = i18nList.map((i18n, index) => {
          return i18n._.listen(() => {
            const data = this.state.sign.split(SPLIT_STR);
            data[index] = getSignature(i18n);
            this.setState({
              sign: data.join(SPLIT_STR),
            });
          });
        });
      }

      componentWillUnmount() {
        this.listeners.forEach((unListen) => unListen());
      }

      render() {
        const { sign } = this.state;

        return <WrappedComponent {...this.props} $i18n$={sign} />;
      }
    }
  
    return hoist(I18nComponent, WrappedComponent);
  };
};
