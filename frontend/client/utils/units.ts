// From https://github.com/MyCryptoHQ/MyCrypto/blob/develop/common/libs/units.ts
import BN from 'bn.js';
import { stripHexPrefix } from 'utils/formatters';

export const ZCASH_DECIMAL = 8;
export const Units = {
  zat: '1',
  zcash: '100000000',
};

export type Zat = BN;
export type Usd = BN;
export type UnitKey = keyof typeof Units;

export const handleValues = (input: string | BN) => {
  if (typeof input === 'string') {
    return input.startsWith('0x') ? new BN(stripHexPrefix(input), 16) : new BN(input);
  }
  if (typeof input === 'number') {
    return new BN(input);
  }
  if (BN.isBN(input)) {
    return input;
  } else {
    throw Error('unsupported value conversion');
  }
};

export const Zat = (input: string | BN): Zat => handleValues(input);

const stripRightZeros = (str: string) => {
  const strippedStr = str.replace(/0+$/, '');
  return strippedStr === '' ? null : strippedStr;
};

export const baseToConvertedUnit = (value: string, decimal: number) => {
  if (decimal === 0) {
    return value;
  }
  const paddedValue = value.padStart(decimal + 1, '0'); // 0.1 ==>
  const integerPart = paddedValue.slice(0, -decimal);
  const fractionPart = stripRightZeros(paddedValue.slice(-decimal));
  return fractionPart ? `${integerPart}.${fractionPart}` : `${integerPart}`;
};

const convertedToBaseUnit = (value: string, decimal: number) => {
  if (decimal === 0) {
    return value;
  }
  const [integerPart, fractionPart = ''] = value.split('.');
  const paddedFraction = fractionPart.padEnd(decimal, '0');
  return `${integerPart}${paddedFraction}`;
};

export const fromZat = (zat: Zat) => {
  return baseToConvertedUnit(zat.toString(), ZCASH_DECIMAL);
};

export const toZat = (value: string | number): Zat => {
  value = value.toString();
  const zat = convertedToBaseUnit(value, ZCASH_DECIMAL);
  return Zat(zat);
};

export const toUsd = (value: string | number): Usd => {
  value = value.toString();
  const hasDecimal = value.indexOf('.') !== -1;

  // decimals aren't allowed for proposal targets,
  // but remove decimal if it exists
  value = hasDecimal ? value.split('.')[0] : value;
  return new BN(value, 10);
};

export const getDecimalFromUnitKey = (key: UnitKey) => Units[key].length - 1;
