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

export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

export function isValidAddress(address: string): boolean {
  console.warn('TODO - implement utils.isValidAddress', address);
  return true;
}

export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}
