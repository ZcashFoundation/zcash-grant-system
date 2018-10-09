import React from 'react';
import loadable from 'loadable-components';
import { AUTH_PROVIDER } from 'utils/auth';
import './ProvideIdentity.less';

const AddressProvider = loadable(() => import('./providers/Address'));
const LedgerProvider = loadable(() => import('./providers/Ledger'));
const TrezorProvider = loadable(() => import('./providers/Trezor'));
const Web3Provider = loadable(() => import('./providers/Web3'));

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
