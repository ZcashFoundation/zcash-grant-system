// Adapted from documentation here: https://www.bitgo.com/api/v2/?javascript
// Far from exhaustive, only functions used are properly typed.

declare module 'bitgo' {
  // Wallet
  interface CreateAddressOptions {
    label: string;
  }

  interface GetAddressesOptions {
    labelContains?: string;
    limit?: number;
    mine?: boolean;
    prevId?: string;
    chains?: number[];
    sort?: 1 | -1;
  }

  interface AddressInfo {
    id: string;
    address: string;
    chain: number;
    index: number;
    coin: string;
    lastNonce: number;
    wallet: string;
    label: string;
    addressType: string;
  }

  interface GetAddressResponse {
    coin: string;
    totalAddressCount: number;
    pendingAddressCount: number;
    addresses: AddressInfo[];
    nextBatchPrevId: string;
  }

  export class Wallet {
    id(): string;
    label(): string;
    createAddress(options?: CreateAddressOptions): Promise<AddressInfo>;
    addresses(options?: GetAddressesOptions): Promise<GetAddressResponse>;
  }

  // Wallets
  interface GetWalletOptions {
    id: string;
  }

  export class Wallets {
    get(options: GetWalletOptions): Promise<Wallet>;
  }

  // BaseCoin
  export class BaseCoin {
    wallets(): Wallets;
  }

  // BitGo
  interface BitGoOptions {
    env: 'test' | 'prod';
    accessToken: string;
    proxy?: string;
  }

  export class BitGo {
    constructor(options: BitGoOptions);
    coin(coin: string): BaseCoin;
  }
}
