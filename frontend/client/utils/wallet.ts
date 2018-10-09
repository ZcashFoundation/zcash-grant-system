import HDKey from 'hdkey';
import { pubToAddress, toChecksumAddress } from 'ethereumjs-util';

interface DeriveAddressesParams {
  chainCode: string;
  publicKey: string;
  index: number;
  numAddresses: number;
}
export function deriveAddressesFromPubKey(params: DeriveAddressesParams): string[] {
  const addresses = [];
  const hdkey = new HDKey();
  hdkey.chainCode = new Buffer(params.chainCode, 'hex');
  hdkey.publicKey = new Buffer(params.publicKey, 'hex');

  for (let i = params.index; i < params.index + params.numAddresses; i++) {
    const dkey = hdkey.derive(`m/${i}`);
    const address = (pubToAddress(dkey.publicKey, true) as Buffer).toString('hex');
    addresses.push(toChecksumAddress(address));
  }

  return addresses;
}

// Ledger throws a few types of errors
interface U2FError {
  metaData: {
    type: string;
    code: number;
  };
}
interface ErrorWithId {
  id: string;
  message: string;
  name: string;
  stack: string;
}
type LedgerError = U2FError | ErrorWithId | Error | string;

const isU2FError = (err: LedgerError): err is U2FError =>
  !!err && !!(err as U2FError).metaData;
const isStringError = (err: LedgerError): err is string => typeof err === 'string';
const isErrorWithId = (err: LedgerError): err is ErrorWithId =>
  err.hasOwnProperty('id') && err.hasOwnProperty('message');

export function parseLedgerError(err: LedgerError): string {
  // https://developers.yubico.com/U2F/Libraries/Client_error_codes.html
  if (isU2FError(err)) {
    // Timeout
    if (err.metaData.code === 5) {
      return 'The request timed out';
    }

    return err.metaData.type;
  }

  if (isStringError(err)) {
    // Wrong app logged into
    if (err.includes('6804')) {
      return 'Wrong application selected on your ledger device. Make sure you’ve selected the ETH app.';
    }
    // Ledger locked
    if (err.includes('6801')) {
      return 'Your Ledger device is locked';
    }

    return err;
  }

  if (isErrorWithId(err)) {
    // Browser doesn't support U2F
    if (err.message.includes('U2F not supported')) {
      return 'Your browser doesn’t support Ledger. Please try updating it, or using a different one.';
    }
  }

  // Other
  return err.message || err.toString();
}
