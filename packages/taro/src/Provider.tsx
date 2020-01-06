import { ComponentClass, Component } from '@tarojs/taro';
import { I18nInstance, UnListen } from '@i18n-chain/core';
import { getSignature, SPLIT_STR, getSignatures } from './util';

type State = {
  $sign_for_i18n_provider: string;
};

export const I18nProvider = (...i18nList: I18nInstance[]) => {
  return function<P, T extends ComponentClass<P>>(WrappedComponent: T): T {
    class I18nComponent extends (WrappedComponent as typeof Component)<P, State> {
      static displayName = `I18n(${WrappedComponent.displayName || WrappedComponent.name})`;

      declare state: State;

      constructor(props: P) {
        super(props);
        this._stateState();
      }

      _constructor() {
        // @ts-ignore
        super._constructor?.();
        this._stateState();
      }

      protected _stateState() {
        // @ts-ignore
        if (this.state) {
          this.state.$sign_for_i18n_provider = this.state.$sign_for_i18n_provider || getSignatures(i18nList);
        } else {
          this.state = {
            $sign_for_i18n_provider: getSignatures(i18nList),
          };
        }
      }

      protected listeners: UnListen[] = [];

      componentDidMount() {
        this.listeners = i18nList.map((i18n, index) => {
          return i18n._.listen(() => {
            const data = this.state.$sign_for_i18n_provider.split(SPLIT_STR);
            data[index] = getSignature(i18n);
            this.setState({
              $sign_for_i18n_provider: data.join(SPLIT_STR),
            });
          });
        });

        super.componentDidMount?.();
      }

      componentWillUnmount() {
        this.listeners.forEach((unListen) => unListen());

        super.componentWillUnmount?.();
      }
    }
  
    // @ts-ignore
    return I18nComponent;
  };
};
