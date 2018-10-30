export enum AUTH_PROVIDER {
  WEB3 = 'WEB3',
  LEDGER = 'LEDGER',
  TREZOR = 'TREZOR',
  ADDRESS = 'ADDRESS',
}

interface AuthProvider {
  type: AUTH_PROVIDER;
  name: string;
  canSignMessage: boolean;
}

export const AUTH_PROVIDERS: { [key in AUTH_PROVIDER]: AuthProvider } = {
  [AUTH_PROVIDER.WEB3]: {
    type: AUTH_PROVIDER.WEB3,
    name: 'MetaMask', // TODO: Set dynamically based on provider
    canSignMessage: true,
  },
  [AUTH_PROVIDER.LEDGER]: {
    type: AUTH_PROVIDER.LEDGER,
    name: 'Ledger',
    canSignMessage: true,
  },
  [AUTH_PROVIDER.TREZOR]: {
    type: AUTH_PROVIDER.TREZOR,
    name: 'TREZOR',
    canSignMessage: true,
  },
  [AUTH_PROVIDER.ADDRESS]: {
    type: AUTH_PROVIDER.ADDRESS,
    name: 'Address',
    canSignMessage: false,
  },
};

export function generateAuthSignatureData(address: string) {
  const message = `I am proving the identity of ${address} on Grant.io`;
  const time = new Date().toUTCString();
  return {
    data: { message, time },
    types: {
      message: {
        name: 'Message Proof',
        type: 'string',
      },
      time: {
        name: 'Time',
        type: 'string',
      },
    },
    primaryType: 'message',
  };
}
