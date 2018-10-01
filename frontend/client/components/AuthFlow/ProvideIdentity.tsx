import React from 'react';
import { AUTH_PROVIDER } from 'utils/auth';
import AddressProvider from './providers/Address';
import LedgerProvider from './providers/Ledger';
import TrezorProvider from './providers/Trezor';
import Web3Provider from './providers/Web3';
import './ProvideIdentity.less';

const PROVIDER_COMPONENTS = {
  [AUTH_PROVIDER.ADDRESS]: AddressProvider,
  [AUTH_PROVIDER.LEDGER]: LedgerProvider,
  [AUTH_PROVIDER.TREZOR]: TrezorProvider,
  [AUTH_PROVIDER.WEB3]: Web3Provider,
};

interface Props {
  provider: AUTH_PROVIDER;
  onSelectAddress(addr: string): void;
  reset(): void;
}

export default (props: Props) => {
  const ProviderComponent = PROVIDER_COMPONENTS[props.provider];
  return (
    <div className="ProvideIdentity">
      <ProviderComponent onSelectAddress={props.onSelectAddress} />
      <p className="ProvideIdentity-back">
        Want to use a different method? <a onClick={props.reset}>Click here</a>.
      </p>
    </div>
  );
};
