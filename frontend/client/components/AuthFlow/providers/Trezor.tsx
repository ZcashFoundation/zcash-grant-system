import React from 'react';
import TrezorConnect from 'trezor-connect';
import ChooseAddress from './ChooseAddress';
import { deriveAddressesFromPubKey } from 'utils/wallet';

interface Props {
  onSelectAddress(addr: string): void;
}

interface State {
  publicKey: null | string;
  chainCode: null | string;
  addresses: string[];
}

const DPATHS = {
  MAINNET: `m/44'/60'/0'/0`,
  TESTNET: `m/44'/1'/0'/0`,
};

export default class TrezorProvider extends React.Component<Props, State> {
  state: State = {
    publicKey: null,
    chainCode: null,
    addresses: [],
  };

  render() {
    return (
      <ChooseAddress
        addresses={this.state.addresses}
        loadingMessage="Waiting for TREZOR..."
        handleDeriveAddresses={this.deriveAddresses}
        onSelectAddress={this.props.onSelectAddress}
      />
    );
  }

  private deriveAddresses = async (index: number, numAddresses: number) => {
    let { chainCode, publicKey } = this.state;
    if (!chainCode || !publicKey) {
      const res = await this.getPublicKey();
      chainCode = res.chainCode;
      publicKey = res.publicKey;
      this.setState({ chainCode, publicKey });
    }

    const addresses = this.state.addresses.concat(
      deriveAddressesFromPubKey({
        chainCode,
        publicKey,
        index,
        numAddresses,
      }),
    );
    this.setState({ addresses });
  };

  private getPublicKey = async () => {
    const res = await TrezorConnect.getPublicKey({ path: DPATHS.TESTNET });
    if (res.success === false) {
      throw new Error(res.payload.error);
    }
    return res.payload;
  };
}
