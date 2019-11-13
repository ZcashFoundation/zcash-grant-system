export function getAmountError(amount: number, max: number = Infinity, min?: number) {
  if (amount < 0) {
    return 'Amount must be a positive number';
  } else if (
    amount.toFixed(3).length < amount.toString().length ||
    amount.toString().includes('1e')
  ) {
    return 'Must be in increments of 0.001';
  } else if (amount > max) {
    return `Cannot exceed maximum (${max} ZEC)`;
  } else if (min && amount < min) {
    return `Must be at least ${min} ZEC`;
  }

  return null;
}

export function getAmountErrorFromString(amount: string, max?: number, min?: number) {
  const parsedAmount = parseFloat(amount)
  if (Number.isNaN(parsedAmount)) {
    return 'Not a valid number'
  }
  // prevents "-0" from being valid...
  if (amount[0] === '-') {
    return 'Amount must be a positive number'
  }
  return getAmountError(parsedAmount, max, min)
}

export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

// Uses simple regex to validate addresses, doesn't check checksum or network
export function isValidTAddress(address: string): boolean {
  if (/^t[a-zA-Z0-9]{34}$/.test(address)) {
    return true;
  }
  return false;
}

export function isValidSproutAddress(address: string): boolean {
  if (/^z[a-zA-Z0-9]{94}$/.test(address)) {
    return true;
  }
  return false;
}

export function isValidSaplingAddress(address: string): boolean {
  if (/^z(s)?(reg)?(testsapling)?[a-zA-Z0-9]{76}$/.test(address)) {
    return true;
  }
  return false;
}

export function isValidAddress(a: string): boolean {
  return isValidTAddress(a) || isValidSproutAddress(a) || isValidSaplingAddress(a);
}
