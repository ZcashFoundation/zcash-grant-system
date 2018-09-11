export function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function computePercentage(num: number, percent: number) {
  return (num / 100) * percent;
}
