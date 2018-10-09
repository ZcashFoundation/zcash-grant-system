import React from 'react';
import { AUTH_PROVIDER, AUTH_PROVIDERS } from 'utils/auth';
import './SelectProvider.less';

interface Props {
  onSelect(provider: AUTH_PROVIDER): void;
}

export default class SelectProvider extends React.PureComponent<Props> {
  render() {
    return (
      <div className="SelectProvider">
        {Object.values(AUTH_PROVIDERS).map(provider => (
          <button
            key={provider.type}
            className="SelectProvider-provider"
            onClick={() => this.props.onSelect(provider.type)}
          >
            Connect with {provider.name}
          </button>
        ))}
      </div>
    );
  }
}
