import React, { ComponentType, PureComponent } from 'react';
import hoist from 'hoist-non-react-statics';
import { I18nInstance, UnListen } from '@i18n-chain/core';

type State = Readonly<{
  localNames: string[];
}>;

export const I18nProvider = (...i18nList: I18nInstance[]) => {
  return function<T>(WrappedComponent: ComponentType<T>): ComponentType<T> {
    class I18nComponent extends PureComponent<T, State> {
      static displayName = `I18n(${WrappedComponent.displayName || WrappedComponent.name})`;

      readonly state: State = {
        localNames: [],
      };

      protected unListens: UnListen[] = [];

      componentDidMount() {
        this.unListens = i18nList.map((i18n, index) => {
          return i18n._.listen((name) => {
            const { localNames } = this.state;
            const newLocalNames = [...localNames];

            newLocalNames[index] = name;
            this.setState({
              localNames: newLocalNames,
            });
          });
        });
      }
  
      componentWillUnmount() {
        this.unListens.forEach((unListen) => {
          unListen();
        });
      }
  
      render() {
        const { localNames } = this.state;

        return <WrappedComponent {...this.props} $i18n$={localNames.join(',')} />;
      }
    }
  
    return hoist(I18nComponent, WrappedComponent);
  };
};
