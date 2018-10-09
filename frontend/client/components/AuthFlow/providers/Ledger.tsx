import React from 'react';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import LedgerEth from '@ledgerhq/hw-app-eth';
import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import ChooseAddress from './ChooseAddress';
import { deriveAddressesFromPubKey, parseLedgerError } from 'utils/wallet';
import './Ledger.less';

enum ADDRESS_TYPE {
  LEGACY = 'LEGACY',
  LIVE = 'LIVE',
}

interface Props {
  onSelectAddress(addr: string): void;
}

interface State {
  publicKey: null | string;
  chainCode: null | string;
  addresses: string[];
  addressType: ADDRESS_TYPE;
}

const DPATHS = {
  LEGACY: `m/44'/60'/0'/0`,
  LIVE: `m/44'/60'/$index'/0/0`,
};

export default class LedgerProvider extends React.Component<Props, State> {
  state: State = {
    publicKey: null,
    chainCode: null,
    addresses: [],
    addressType: ADDRESS_TYPE.LIVE,
  };

  render() {
    const { addresses, addressType } = this.state;
    return (
      <div className="LedgerProvider">
        <div className="LedgerProvider-type">
          <Radio.Group onChange={this.changeAddressType} value={addressType} size="large">
            <Radio.Button value={ADDRESS_TYPE.LIVE}>Live</Radio.Button>
            <Radio.Button value={ADDRESS_TYPE.LEGACY}>Legacy</Radio.Button>
          </Radio.Group>
        </div>

        <ChooseAddress
          addresses={addresses}
          loadingMessage="Waiting for Ledger..."
          handleDeriveAddresses={this.deriveAddresses}
          onSelectAddress={this.props.onSelectAddress}
        />

        <div className="LedgerProvider-hint">
          Don't see your address? Try changing between Live and Legacy addresses.
        </div>
      </div>
    );
  }

  private deriveAddresses = async (index: number, numAddresses: number) => {
    const { addressType } = this.state;
    let addresses = [...this.state.addresses];

    try {
      if (addressType === ADDRESS_TYPE.LIVE) {
        const app = await this.getEthApp();
        for (let i = index; i < index + numAddresses; i++) {
          const res = await app.getAddress(DPATHS.LIVE.replace('$index', i.toString()));
          addresses.push(res.address);
        }
      } else {
        let { chainCode, publicKey } = this.state;
        if (!chainCode || !publicKey) {
          const app = await this.getEthApp();
          const res = await app.getAddress(DPATHS.LEGACY, false, true);
          chainCode = res.chainCode;
          publicKey = res.publicKey;
          this.setState({ chainCode, publicKey });
        }

        addresses = addresses.concat(
          deriveAddressesFromPubKey({
            chainCode,
            publicKey,
            index,
            numAddresses,
          }),
        );
      }
    } catch (err) {
      const msg = parseLedgerError(err);
      throw new Error(msg);
    }

    this.setState({ addresses });
  };

  private getEthApp = async () => {
    const transport = await TransportU2F.create();
    return new LedgerEth(transport);
  };

  private changeAddressType = (ev: RadioChangeEvent) => {
    const addressType = ev.target.value as ADDRESS_TYPE;
    if (addressType === this.state.addressType) {
      return;
    }
    this.setState({
      addresses: [],
      addressType,
    });
  };
}
