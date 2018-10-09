declare module 'trezor-connect' {
  type Path = number[] | string;

  interface ErrorResponse {
    success: false;
    payload: {
      error: string;
    };
  }
  type SuccessResponse<T> = {
    success: true;
    payload: T;
  };
  type Response<T> = ErrorResponse | SuccessResponse<T>;

  interface OptionalCommonParams {
    device?: {
      path: string;
      state?: string;
      instance?: number;
    };
    useEmptyPassphrase?: boolean;
    keepSession?: boolean;
  }

  namespace TrezorConnect {
    // ethereumGetAddress (single & bundle overloads)
    interface EthereumGetAddressParams {
      path: Path;
      showOnTrezor: boolean;
    }
    interface EthereumGetAddressPayload {
      address: string;
      path: number[];
      serializedPath: string;
    }
    type EthereumGetAddressResponse = Response<EGASinglePayload>;
    export function ethereumGetAddress(
      params: EthereumGetAddressParams,
    ): Promise<EthereumGetAddressResponse>;

    interface EthereumGetAddressBundleParams {
      bundle: EthereumGetAddressParams[];
    }
    type EthereumGetAddressBundleResponse = Response<EthereumGetAddressPayload[]>;
    export function ethereumGetAddress(
      params: EthereumGetAddressBundleParams,
    ): Promise<EthereumGetAddressBundleResponse>;

    // getPublicKey (single & bundle overloads)
    interface GetPublicKeyParams {
      path: string;
      coin?: string;
    }
    interface GetPublicKeyPayload {
      path: Array<number>;
      serializedPath: string;
      xpub: string;
      xpubSegwit?: string;
      chainCode: string;
      childNum: number;
      publicKey: string;
      fingerprint: number;
      depth: number;
    }
    type GetPublicKeyResponse = Response<GetPublicKeyPayload>;
    export function getPublicKey(
      params: GetPublicKeyParams,
    ): Promise<GetPublicKeyResponse>;

    interface GetPublicKeyBundleParams {
      bundle: GetPublicKeyParams[];
    }
    type GetPublicKeyBundleResponse = Response<GetPublicKeyPayload[]>;
    export function getPublicKey(
      params: GetPublicKeyBundleParams,
    ): Promise<GetPublicKeyBundleResponse>;
  }

  export default TrezorConnect;
}
