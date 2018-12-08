export enum AUTH_PROVIDER {
  ADDRESS = 'ADDRESS',
}

interface AuthProvider {
  type: AUTH_PROVIDER;
  name: string;
  canSignMessage: boolean;
}

export const AUTH_PROVIDERS: { [key in AUTH_PROVIDER]: AuthProvider } = {
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
      authorization: [
        {
          name: 'Message Proof',
          type: 'string',
        },
        {
          name: 'Time',
          type: 'string',
        },
      ],
    },
    primaryType: 'authorization',
  };
}
