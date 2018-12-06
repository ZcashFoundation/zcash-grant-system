import { toChecksumAddress } from 'ethereumjs-util';

export function getAmountError(amount: number, max: number = Infinity) {
  if (amount < 0) {
    return 'Amount must be a positive number';
  } else if (
    amount.toFixed(3).length < amount.toString().length ||
    amount.toString().includes('1e')
  ) {
    return 'Must be in increments of 0.001';
  } else if (amount > max) {
    return `Cannot exceed maximum (${max} ETH)`;
  }

  return null;
}

export function isValidEthAddress(addr: string): boolean {
  if (addr === '0x0000000000000000000000000000000000000000') {
    return false;
  }
  if (addr.substring(0, 2) !== '0x') {
    return false;
  } else if (!/^(0x)?[0-9a-f]{40}$/i.test(addr)) {
    return false;
  } else if (/^(0x)?[0-9a-f]{40}$/.test(addr) || /^(0x)?[0-9A-F]{40}$/.test(addr)) {
    return true;
  } else {
    return addr === toChecksumAddress(addr);
  }
}

export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}
