import React, { ComponentType, PureComponent } from 'react';
import hoist from 'hoist-non-react-statics';
import { I18n, UnListen } from './I18n';

type State = Readonly<{
  count: number;
}>;

export const I18nProvider = (...i18nList: I18n<any>[]) => {
  return function<T>(WrappedComponent: ComponentType<T>): ComponentType<T> {
    class I18nComponent extends PureComponent<T, State> {
      static displayName = `I18n(${WrappedComponent.displayName || WrappedComponent.name})`;

      readonly state: State = {
        count: 0,
      };

      protected unListens: UnListen[] = [];

      componentDidMount() {
        this.unListens = i18nList.map((i18n) => {
          return i18n.listen(() => {
            this.setState({
              count: this.state.count + 1,
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
        const { count } = this.state;

        return <WrappedComponent {...this.props} $i18n$={count} />;
      }
    }
  
    return hoist(I18nComponent, WrappedComponent);
  };
};
